import Stripe from "stripe";
import { activateApplicantPlan } from "@/db/applicant-profiles";
import { applyStripeEvent } from "@/lib/stripe-webhook";
import { captureServerEvent } from "@/lib/analytics-server";

export const runtime = "nodejs";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured.");
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return Response.json({ error: "Webhook verification is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Unable to verify Stripe webhook signature", error);
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    const result = await applyStripeEvent(event, {
      activatePlan: activateApplicantPlan,
      onPurchase: (purchase) =>
        captureServerEvent({
          event: "purchase",
          distinctId: purchase.userId,
          properties: {
            plan: purchase.plan,
            value: purchase.amountCents / 100,
            amount_cents: purchase.amountCents,
            currency: purchase.currency.toUpperCase(),
            stripe_customer_id: purchase.customerId,
            stripe_event_id: purchase.stripeEventId,
          },
        }),
    });
    return Response.json({ received: true, result });
  } catch (error) {
    console.error("Unable to persist Stripe webhook event", error);
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
