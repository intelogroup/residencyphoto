import { describe, expect, it, vi } from "vitest";
import { applyStripeEvent } from "./stripe-webhook";

describe("applyStripeEvent", () => {
  it("activates the purchased plan for a paid Checkout Session", async () => {
    const activatePlan = vi.fn().mockResolvedValue(undefined);

    const result = await applyStripeEvent(
      {
        id: "evt_paid",
        type: "checkout.session.completed",
        data: {
          object: {
            object: "checkout.session",
            client_reference_id: "user_123",
            customer: "cus_123",
            payment_status: "paid",
            amount_total: 400,
            currency: "usd",
            metadata: { plan: "Resident", neonUserId: "user_123" },
          },
        },
      },
      { activatePlan },
    );

    expect(result).toBe("processed");
    expect(activatePlan).toHaveBeenCalledWith("user_123", "Resident", "cus_123");
  });

  it("ignores unpaid or internally inconsistent Checkout Sessions", async () => {
    const activatePlan = vi.fn();
    const baseSession = {
      object: "checkout.session",
      client_reference_id: "user_123",
      customer: "cus_123",
      payment_status: "unpaid",
      amount_total: 400,
      currency: "usd",
      metadata: { plan: "Resident", neonUserId: "different_user" },
    };

    await expect(applyStripeEvent(
      { id: "evt_unpaid", type: "checkout.session.completed", data: { object: baseSession } },
      { activatePlan },
    )).resolves.toBe("ignored");
    expect(activatePlan).not.toHaveBeenCalled();
  });

  it("is safe to replay because activation converges on the same profile state", async () => {
    const profile = { plan: "Free", customerId: null as string | null };
    const activatePlan = vi.fn(async (_userId: string, plan: "Resident" | "Program", customerId: string) => {
      profile.plan = plan;
      profile.customerId = customerId;
    });
    const event = {
      id: "evt_replayed",
      type: "checkout.session.completed",
      data: {
        object: {
          object: "checkout.session",
          client_reference_id: "user_123",
          customer: "cus_123",
          payment_status: "paid",
          amount_total: 1900,
          currency: "usd",
          metadata: { plan: "Program", neonUserId: "user_123" },
        },
      },
    };

    await applyStripeEvent(event, { activatePlan });
    await applyStripeEvent(event, { activatePlan });

    expect(profile).toEqual({ plan: "Program", customerId: "cus_123" });
  });
});
