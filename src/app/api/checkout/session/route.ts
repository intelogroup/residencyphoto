import Stripe from "stripe";
import { auth } from "@/lib/auth/server";
import { getStripePlan } from "@/lib/stripe-plans";
import { activateApplicantPlan } from "@/db/applicant-profiles";

export const runtime = "nodejs";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  return new Stripe(secretKey);
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_")) {
    return Response.json({ error: "Invalid checkout session." }, { status: 400 });
  }

  const { data: authSession } = await auth.getSession();
  if (!authSession?.user?.id) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
    const plan = getStripePlan(session.metadata?.plan);
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (
      !plan ||
      !customerId ||
      session.client_reference_id !== authSession.user.id ||
      session.metadata?.neonUserId !== authSession.user.id ||
      session.payment_status !== "paid" ||
      session.amount_total !== plan.amount ||
      session.currency !== plan.currency
    ) {
      return Response.json({ error: "This checkout session is not paid." }, { status: 400 });
    }

    // Webhooks remain the source of truth, while this idempotent write avoids
    // making a returning customer wait for webhook delivery before fulfillment.
    await activateApplicantPlan(authSession.user.id, plan.name, customerId);
    return Response.json({ plan: plan.name });
  } catch (error) {
    console.error("Unable to verify Stripe Checkout Session", error);
    return Response.json(
      { error: "We could not verify this payment." },
      { status: 500 },
    );
  }
}
