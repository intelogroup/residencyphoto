import { describe, expect, it, vi } from "vitest";
import { applyStripeEvent, purchaseInfoSchema } from "./stripe-webhook";

const validSession = {
  object: "checkout.session",
  client_reference_id: "user_123",
  customer: "cus_123",
  payment_status: "paid",
  amount_total: 400,
  currency: "usd",
  metadata: { plan: "Resident", neonUserId: "user_123" },
};

describe("stripe-webhook zod boundary", () => {
  it("ignores a structurally malformed session instead of throwing", async () => {
    const activatePlan = vi.fn();
    const malformed = { ...validSession, amount_total: "400" };

    const result = await applyStripeEvent(
      { id: "evt_malformed", type: "checkout.session.completed", data: { object: malformed } },
      { activatePlan },
    );

    expect(result).toBe("ignored");
    expect(activatePlan).not.toHaveBeenCalled();
  });

  it("ignores a malformed event envelope", async () => {
    const activatePlan = vi.fn();

    const result = await applyStripeEvent(
      { id: 123, type: "checkout.session.completed" },
      { activatePlan },
    );

    expect(result).toBe("ignored");
    expect(activatePlan).not.toHaveBeenCalled();
  });

  it("still processes a valid paid session", async () => {
    const activatePlan = vi.fn().mockResolvedValue(undefined);

    const result = await applyStripeEvent(
      { id: "evt_ok", type: "checkout.session.completed", data: { object: validSession } },
      { activatePlan },
    );

    expect(result).toBe("processed");
    expect(activatePlan).toHaveBeenCalledWith("user_123", "Resident", "cus_123");
  });

  it("purchaseInfoSchema rejects an invalid purchase loudly", () => {
    const bad = {
      userId: "",
      plan: "Resident",
      amountCents: 400,
      currency: "usd",
      customerId: "cus_123",
      stripeEventId: "evt_x",
    };
    expect(() => purchaseInfoSchema.parse(bad)).toThrow();

    const ok = { ...bad, userId: "user_123" };
    expect(purchaseInfoSchema.parse(ok)).toMatchObject({ userId: "user_123", plan: "Resident" });
  });
});
