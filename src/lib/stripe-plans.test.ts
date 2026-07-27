import { describe, expect, it } from "vitest";
import { getStripePlan, getStripePriceId } from "./stripe-plans";

describe("getStripePlan", () => {
  it("returns the server-controlled Resident price configuration", () => {
    expect(getStripePlan("Resident")).toMatchObject({
      name: "Resident",
      amount: 400,
      currency: "usd",
    });
  });

  it("returns the server-controlled Program price configuration", () => {
    expect(getStripePlan("Program")).toMatchObject({
      name: "Program",
      amount: 1900,
      currency: "usd",
    });
  });

  it("rejects an unknown plan instead of accepting a client-supplied price", () => {
    expect(getStripePlan("Resident&amount=1")).toBeNull();
  });

  it("uses the configured Stripe Price ID for the selected plan", () => {
    expect(
      getStripePriceId("Resident", {
        STRIPE_RESIDENT_PRICE_ID: "price_resident",
      }),
    ).toBe("price_resident");
  });

  it("does not fall back to dynamic price data when a Stripe Price ID is missing", () => {
    expect(getStripePriceId("Program", {})).toBeNull();
  });
});
