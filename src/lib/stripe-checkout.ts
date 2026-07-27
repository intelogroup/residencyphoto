import { getStripePlan, getStripePriceId, type StripePlanName } from "./stripe-plans";

export interface CheckoutUser {
  id: string;
  email: string;
  name?: string | null;
}

interface CheckoutInput {
  plan: unknown;
  user: CheckoutUser;
  origin: string;
}

interface CheckoutDependencies {
  priceEnv: Record<string, string | undefined>;
  getCustomerId: (userId: string) => Promise<string | null>;
  saveCustomerId: (userId: string, customerId: string) => Promise<void>;
  createCustomer: (input: CheckoutUser) => Promise<{ id: string }>;
  createSession: (input: {
    customerId: string;
    plan: StripePlanName;
    priceId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<{ url: string | null }>;
}

export async function createCheckoutForUser(
  input: CheckoutInput,
  dependencies: CheckoutDependencies,
): Promise<{ url: string }> {
  const plan = getStripePlan(input.plan);
  if (!plan) throw new Error("Please choose a valid plan.");

  const priceId = getStripePriceId(plan.name, dependencies.priceEnv);
  if (!priceId) throw new Error(`Stripe Price ID is not configured for ${plan.name}.`);

  let customerId = await dependencies.getCustomerId(input.user.id);
  if (!customerId) {
    const customer = await dependencies.createCustomer(input.user);
    customerId = customer.id;
    await dependencies.saveCustomerId(input.user.id, customerId);
  }

  const session = await dependencies.createSession({
    customerId,
    plan: plan.name,
    priceId,
    userId: input.user.id,
    successUrl: `${input.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${input.origin}/checkout?plan=${plan.name}`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");

  return { url: session.url };
}
