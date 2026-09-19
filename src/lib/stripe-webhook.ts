import { z } from "zod";
import { getStripePlan, type StripePlanName } from "./stripe-plans";
import { logger } from "./logger";

/**
 * Zod schemas for the Stripe webhook boundary.
 * Anything arriving here failed loudly before: signature-verified but
 * structurally wrong payloads were silently "ignored". Now malformed
 * sessions are still ignored (Stripe may send event types we don't
 * care about) but the reason is logged with the event id; the purchase
 * object that reaches our DB + analytics is validated strictly and
 * throws on violation, so a genuine inconsistency pages us via a 500
 * (and Stripe retries) instead of corrupting state quietly.
 */

const stripeEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({
    object: z.unknown(),
  }),
});

const checkoutSessionSchema = z.object({
  object: z.literal("checkout.session"),
  client_reference_id: z.string().nullable(),
  customer: z
    .union([z.string(), z.object({ id: z.string().optional() }), z.null()])
    .nullable()
    .optional(),
  payment_status: z.string(),
  amount_total: z.number().nullable(),
  currency: z.string().nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
});

/** The normalized purchase handed to plan activation + analytics. */
export const purchaseInfoSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["Resident", "Program"]),
  /** Amount in the currency's minor unit (cents for USD). */
  amountCents: z.number().int().positive(),
  currency: z.string().length(3),
  customerId: z.string().min(1),
  stripeEventId: z.string().min(1),
});

export interface PurchaseInfo extends z.infer<typeof purchaseInfoSchema> {
  plan: StripePlanName;
}

interface WebhookDependencies {
  activatePlan: (userId: string, plan: StripePlanName, customerId: string) => Promise<void>;
  /**
   * Optional hook fired after a purchase is processed (plan activated).
   * Used for conversion tracking. Failures are swallowed so analytics
   * can never break webhook processing.
   */
  onPurchase?: (purchase: PurchaseInfo) => Promise<void> | void;
}

const HANDLED_TYPES = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export async function applyStripeEvent(
  rawEvent: unknown,
  dependencies: WebhookDependencies,
): Promise<"ignored" | "processed"> {
  const event = stripeEventSchema.safeParse(rawEvent);
  if (!event.success) {
    logger.warn(
      { zodIssues: event.error.issues },
      "Stripe webhook: event failed schema validation, ignoring",
    );
    return "ignored";
  }

  if (!HANDLED_TYPES.has(event.data.type)) {
    return "ignored";
  }

  const session = checkoutSessionSchema.safeParse(event.data.data.object);
  if (!session.success) {
    logger.warn(
      { eventId: event.data.id, zodIssues: session.error.issues },
      "Stripe webhook: checkout session failed schema validation, ignoring",
    );
    return "ignored";
  }

  const s = session.data;
  const plan = getStripePlan(s.metadata?.plan);
  const userId = s.client_reference_id;
  const metadataUserId = s.metadata?.neonUserId;
  const customerId =
    typeof s.customer === "string" ? s.customer : s.customer?.id;

  if (
    !plan ||
    !userId ||
    metadataUserId !== userId ||
    !customerId ||
    s.payment_status !== "paid" ||
    s.amount_total !== plan.amount ||
    s.currency !== plan.currency
  ) {
    logger.info(
      {
        eventId: event.data.id,
        hasPlan: Boolean(plan),
        hasUserId: Boolean(userId),
        userIdMatches: metadataUserId === userId,
        hasCustomerId: Boolean(customerId),
        paymentStatus: s.payment_status,
        amountTotal: s.amount_total,
        currency: s.currency,
      },
      "Stripe webhook: session ignored (unpaid or internally inconsistent)",
    );
    return "ignored";
  }

  // Strict validation of the exact object we persist + track. Throws on
  // violation: a loud 500 (Stripe retries) instead of silent corruption.
  const purchase: PurchaseInfo = purchaseInfoSchema.parse({
    userId,
    plan: plan.name,
    amountCents: plan.amount,
    currency: plan.currency,
    customerId,
    stripeEventId: event.data.id,
  });

  await dependencies.activatePlan(purchase.userId, purchase.plan, purchase.customerId);

  if (dependencies.onPurchase) {
    try {
      await dependencies.onPurchase(purchase);
    } catch (error) {
      logger.error(
        { err: error, stripeEventId: purchase.stripeEventId },
        "Purchase tracking hook failed (webhook still processed)",
      );
    }
  }

  logger.info(
    {
      stripeEventId: purchase.stripeEventId,
      userId: purchase.userId,
      plan: purchase.plan,
      amountCents: purchase.amountCents,
      currency: purchase.currency,
    },
    "Stripe webhook: purchase processed",
  );

  return "processed";
}
