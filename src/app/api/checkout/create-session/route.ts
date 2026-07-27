import Stripe from "stripe";
import { auth } from "@/lib/auth/server";
import { createCheckoutForUser } from "@/lib/stripe-checkout";
import { getStripePlan } from "@/lib/stripe-plans";
import { getStripeCustomerId, saveStripeCustomerId } from "@/db/applicant-profiles";
import { checkCheckoutRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured.");
  return new Stripe(secretKey);
}

function getAppOrigin(request: Request): string {
  return new URL(process.env.APP_URL ?? request.url).origin;
}

export async function POST(request: Request) {
  let payload: { plan?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!getStripePlan(payload.plan)) {
    return Response.json({ error: "Please choose a valid plan." }, { status: 400 });
  }

  const { data: session } = await auth.getSession();
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Please sign in before checking out." }, { status: 401 });
  }

  const { success } = await checkCheckoutRateLimit(session.user.id);
  if (!success) {
    return Response.json({ error: "Too many checkout attempts. Try again shortly." }, { status: 429 });
  }

  try {
    const stripe = getStripeClient();
    return Response.json(
      await createCheckoutForUser(
        {
          plan: payload.plan,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          },
          origin: getAppOrigin(request),
        },
        {
          priceEnv: process.env,
          getCustomerId: getStripeCustomerId,
          saveCustomerId: saveStripeCustomerId,
          createCustomer: (user) =>
            stripe.customers.create(
              {
                email: user.email,
                name: user.name || undefined,
                metadata: { neonUserId: user.id },
              },
              { idempotencyKey: `residencyphoto:customer:${user.id}` },
            ),
          createSession: (checkout) =>
            stripe.checkout.sessions.create({
              mode: "payment",
              customer: checkout.customerId,
              client_reference_id: checkout.userId,
              metadata: { plan: checkout.plan, neonUserId: checkout.userId },
              payment_intent_data: {
                metadata: { plan: checkout.plan, neonUserId: checkout.userId },
              },
              line_items: [{ price: checkout.priceId, quantity: 1 }],
              success_url: checkout.successUrl,
              cancel_url: checkout.cancelUrl,
            }),
        },
      ),
    );
  } catch (error) {
    console.error("Unable to create Stripe Checkout Session", error);
    return Response.json(
      { error: "We could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
