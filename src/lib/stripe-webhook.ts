import { getStripePlan, type StripePlanName } from "./stripe-plans";

interface StripeEventLike {
  id: string;
  type: string;
  data: { object: unknown };
}

interface CheckoutSessionLike {
  object: "checkout.session";
  client_reference_id: string | null;
  customer: string | { id?: string } | null;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
}

interface WebhookDependencies {
  activatePlan: (userId: string, plan: StripePlanName, customerId: string) => Promise<void>;
}

function isCheckoutSession(value: unknown): value is CheckoutSessionLike {
  return typeof value === "object" && value !== null &&
    "object" in value && value.object === "checkout.session";
}

export async function applyStripeEvent(
  event: StripeEventLike,
  dependencies: WebhookDependencies,
): Promise<"ignored" | "processed"> {
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return "ignored";
  }

  if (!isCheckoutSession(event.data.object)) return "ignored";
  const session = event.data.object;
  const plan = getStripePlan(session.metadata?.plan);
  const userId = session.client_reference_id;
  const metadataUserId = session.metadata?.neonUserId;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (
    !plan ||
    !userId ||
    metadataUserId !== userId ||
    !customerId ||
    session.payment_status !== "paid" ||
    session.amount_total !== plan.amount ||
    session.currency !== plan.currency
  ) {
    return "ignored";
  }

  await dependencies.activatePlan(userId, plan.name, customerId);
  return "processed";
}
