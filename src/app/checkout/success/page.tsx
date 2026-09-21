"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { getStripePlan, type StripePlanName } from "@/lib/stripe-plans";
import { trackGoogleAdsPurchase } from "@/components/GoogleAdsTag";

type Status = "verifying" | "success" | "error";

function CheckoutSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const session = authClient.useSession();
  const [status, setStatus] = useState<Status>("verifying");
  const [plan, setPlan] = useState<StripePlanName | null>(null);
  const [error, setError] = useState("");
  const conversionFiredFor = useRef<string | null>(null);

  useEffect(() => {
    if (session.isPending) return;
    const sessionId = params.get("session_id");
    let active = true;
    async function verifyPayment() {
      if (!sessionId || !session.data?.user) {
        throw new Error("We could not find the checkout session or your account.");
      }

      const response = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
      const data = (await response.json()) as { plan?: StripePlanName; error?: string };
      if (!response.ok || !data.plan) {
        throw new Error(data.error ?? "We could not verify this payment.");
      }

      if (active) {
        setPlan(data.plan);
        setStatus("success");
      }
    }

    void verifyPayment().catch((verificationError) => {
      if (active) {
        setStatus("error");
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "We could not verify this payment.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [params, session.data?.user, session.isPending]);

  // Fire the Google Ads purchase conversion once per verified session.
  useEffect(() => {
    if (status !== "success" || !plan) return;
    const sessionId = params.get("session_id");
    if (!sessionId || conversionFiredFor.current === sessionId) return;
    conversionFiredFor.current = sessionId;
    const stripePlan = getStripePlan(plan);
    trackGoogleAdsPurchase({
      sessionId,
      value: (stripePlan?.amount ?? 0) / 100,
      currency: "USD",
    });
  }, [status, plan, params]);

  return (
    <main id="main-content" className="min-h-screen bg-bg bg-grid-medical flex items-center justify-center p-6">
      <div className="w-full max-w-md card bg-white p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        {status === "verifying" && (
          <>
            <span className="tag">Verifying payment</span>
            <h1 className="mt-3 font-sans text-2xl font-semibold text-heading">Just a moment</h1>
            <p className="mt-3 text-sm text-muted">We&apos;re confirming your Stripe payment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <span className="tag">Payment received</span>
            <h1 className="mt-3 font-sans text-2xl font-semibold text-heading">You&apos;re upgraded to {plan}</h1>
            <p className="mt-3 text-sm text-muted">Your payment is confirmed and your plan is syncing to your account.</p>
            <button onClick={() => router.push("/dashboard")} className="btn-primary mt-6">Go to dashboard</button>
          </>
        )}
        {status === "error" && (
          <>
            <span className="tag">Payment needs attention</span>
            <h1 className="mt-3 font-sans text-2xl font-semibold text-heading">We couldn&apos;t confirm your payment</h1>
            <p role="alert" className="mt-3 text-sm text-muted">{error}</p>
            <Link href="/checkout?plan=Resident" className="btn-primary inline-block mt-6">Return to checkout</Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessShell><span className="tag">Verifying payment</span><p className="mt-3 text-sm text-muted">Loading checkout details…</p></SuccessShell>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function SuccessShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-bg bg-grid-medical flex items-center justify-center p-6">
      <div className="w-full max-w-md card bg-white p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        {children}
      </div>
    </main>
  );
}
