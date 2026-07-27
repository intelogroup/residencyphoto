import { describe, expect, it, vi } from "vitest";
import { createCheckoutForUser } from "./stripe-checkout";

describe("createCheckoutForUser", () => {
  it("reuses the applicant's Stripe customer and configured Price", async () => {
    const createCustomer = vi.fn();
    const saveCustomerId = vi.fn();
    const createSession = vi.fn().mockResolvedValue({ url: "https://checkout.stripe.test/session" });

    const result = await createCheckoutForUser(
      {
        plan: "Resident",
        user: { id: "user_123", email: "doctor@example.com", name: "Doctor Example" },
        origin: "https://residencyphoto.com",
      },
      {
        priceEnv: { STRIPE_RESIDENT_PRICE_ID: "price_resident" },
        getCustomerId: vi.fn().mockResolvedValue("cus_existing"),
        saveCustomerId,
        createCustomer,
        createSession,
      },
    );

    expect(result).toEqual({ url: "https://checkout.stripe.test/session" });
    expect(createCustomer).not.toHaveBeenCalled();
    expect(saveCustomerId).not.toHaveBeenCalled();
    expect(createSession).toHaveBeenCalledWith({
      customerId: "cus_existing",
      plan: "Resident",
      priceId: "price_resident",
      userId: "user_123",
      successUrl: "https://residencyphoto.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://residencyphoto.com/checkout?plan=Resident",
    });
  });

  it("creates and persists a Stripe customer before starting checkout", async () => {
    const saveCustomerId = vi.fn().mockResolvedValue(undefined);
    const createSession = vi.fn().mockResolvedValue({ url: "https://checkout.stripe.test/new" });

    await createCheckoutForUser(
      {
        plan: "Program",
        user: { id: "user_new", email: "program@example.com", name: "Program Director" },
        origin: "http://localhost:3000",
      },
      {
        priceEnv: { STRIPE_PROGRAM_PRICE_ID: "price_program" },
        getCustomerId: vi.fn().mockResolvedValue(null),
        saveCustomerId,
        createCustomer: vi.fn().mockResolvedValue({ id: "cus_new" }),
        createSession,
      },
    );

    expect(saveCustomerId).toHaveBeenCalledWith("user_new", "cus_new");
    expect(saveCustomerId.mock.invocationCallOrder[0]).toBeLessThan(
      createSession.mock.invocationCallOrder[0],
    );
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({
      customerId: "cus_new",
      priceId: "price_program",
      userId: "user_new",
    }));
  });

  it("fails closed when a plan has no configured Stripe Price", async () => {
    await expect(
      createCheckoutForUser(
        {
          plan: "Resident",
          user: { id: "user_123", email: "doctor@example.com" },
          origin: "http://localhost:3000",
        },
        {
          priceEnv: {},
          getCustomerId: vi.fn(),
          saveCustomerId: vi.fn(),
          createCustomer: vi.fn(),
          createSession: vi.fn(),
        },
      ),
    ).rejects.toThrow("Stripe Price ID is not configured for Resident.");
  });
});
