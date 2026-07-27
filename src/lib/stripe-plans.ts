export type StripePlanName = "Resident" | "Program";

export interface StripePlan {
  name: StripePlanName;
  amount: number;
  currency: "usd";
  productName: string;
  description: string;
}

const STRIPE_PLANS: Record<StripePlanName, StripePlan> = {
  Resident: {
    name: "Resident",
    amount: 400,
    currency: "usd",
    productName: "ResidencyPhoto Resident",
    description: "Unlimited ERAS photo downloads",
  },
  Program: {
    name: "Program",
    amount: 1900,
    currency: "usd",
    productName: "ResidencyPhoto Program",
    description: "Bulk ERAS photo processing for programs",
  },
};

export function getStripePlan(plan: unknown): StripePlan | null {
  if (plan !== "Resident" && plan !== "Program") return null;
  return STRIPE_PLANS[plan];
}

export function getStripePriceId(
  plan: StripePlanName,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const key = plan === "Resident" ? "STRIPE_RESIDENT_PRICE_ID" : "STRIPE_PROGRAM_PRICE_ID";
  const priceId = env[key]?.trim();
  return priceId?.startsWith("price_") ? priceId : null;
}
