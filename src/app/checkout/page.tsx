"use client";

import { ArrowLeft, ArrowRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStripePlan, type StripePlanName } from "@/lib/stripe-plans";
import { authClient } from "@/lib/auth/client";

const PLAN_DETAILS: Record<
  StripePlanName,
  {
    heading: string;
    description: string;
    features: string[];
  }
> = {
  Resident: {
    heading: "Fix your photo and download unlimited versions.",
    description: "Pay once — edit, check, and download your ERAS-ready photo.",
    features: ["Unlimited downloads, no watermark", "Automatic ERAS checks", "Saved photo history"],
  },
  Program: {
    heading: "Process applicant photos at scale.",
    description: "Consistent ERAS exports for your whole cohort.",
    features: ["Bulk processing", "Shared access", "Priority support"],
  },
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function CheckoutContent() {
  const params = useSearchParams();
  const session = authClient.useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedPlan = getStripePlan(params.get("plan"));
  const email = session.data?.user.email ?? null;

  async function startCheckout() {
    if (!selectedPlan || !email || loading) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan.name }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "We could not start checkout. Please try again.");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "We could not start checkout. Please try again.",
      );
      setLoading(false);
    }
  }

  if (!selectedPlan) {
    return (
      <CheckoutShell>
        <div className="mx-auto max-w-lg py-16 text-center sm:py-24">
          <span className="tag">Plan Not Found</span>
          <h1 className="mt-5 text-3xl font-bold text-heading text-balance">Choose a plan to continue</h1>
          <p className="mt-3 leading-relaxed text-body">
            That plan is not available. Review the current options and choose the one that fits your workflow.
          </p>
          <Link href="/#pricing" className="btn-primary mt-7">
            View Plans
            <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </CheckoutShell>
    );
  }

  const details = PLAN_DETAILS[selectedPlan.name];
  const price = formatPrice(selectedPlan.amount, selectedPlan.currency);

  return (
    <CheckoutShell>
      <div className="grid overflow-hidden rounded-xl border border-border bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <section className="p-6 sm:p-9 lg:p-10" aria-labelledby="plan-heading">
          <h1
            id="plan-heading"
            className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-heading text-balance sm:text-[1.9rem]"
          >
            {details.heading}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-body">{details.description}</p>

          <ul className="mt-7 flex flex-wrap gap-2" aria-label={`${selectedPlan.name} plan benefits`}>
            {details.features.map((feature) => (
              <li
                key={feature}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-medium text-heading"
              >
                <Check aria-hidden={true} className="h-3 w-3 text-primary" strokeWidth={2.5} />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <aside className="border-t border-border bg-surface-subtle p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12" aria-label="Order summary">
          <span className="tag">Order Summary</span>
          <div className="mt-6 rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="font-semibold text-heading">{selectedPlan.productName}</p>
                <p className="mt-1 text-sm leading-6 text-body">{selectedPlan.description}</p>
              </div>
              <p className="shrink-0 text-lg font-bold text-heading tabular-nums">{price}</p>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
              <span className="text-sm font-semibold text-heading">Total due today</span>
              <span className="text-2xl font-bold text-heading tabular-nums">{price}</span>
            </div>
            <p className="mt-1 text-right text-xs text-muted">One-time · no subscription</p>
          </div>

          {session.isPending ? (
            <div className="mt-6 rounded-lg border border-border bg-white p-4" aria-live="polite">
              <p className="text-sm font-medium text-heading">Checking your account…</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/50 motion-reduce:animate-none" />
              </div>
            </div>
          ) : email ? (
            <>
              <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-white p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck aria-hidden={true} className="h-4 w-4 text-primary-dark" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">Purchasing as</p>
                  <p className="truncate text-sm font-medium text-heading">{email}</p>
                </div>
              </div>

              {error && (
                <p role="alert" aria-live="polite" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
                  {error}
                </p>
              )}

              <button type="button" onClick={startCheckout} className="btn-primary mt-5 min-h-12 w-full" disabled={loading}>
                {loading ? (
                  "Opening Secure Checkout…"
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight aria-hidden={true} className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-border bg-white p-5">
              <h2 className="font-semibold text-heading">Sign in to purchase</h2>
              <p className="mt-2 text-sm leading-6 text-body">Your purchase stays on your account.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link href="/auth/sign-in" className="btn-primary">
                  Sign In
                </Link>
                <Link href="/auth/sign-up" className="btn-ghost">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-muted">
            <LockKeyhole aria-hidden={true} className="h-3.5 w-3.5" />
            Secure payment on Stripe
          </p>
        </aside>
      </div>
    </CheckoutShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <CheckoutShell>
          <div className="mx-auto max-w-lg py-24 text-center" aria-live="polite">
            <span className="tag">Loading Plan…</span>
            <h1 className="mt-5 text-3xl font-bold text-heading">Preparing your checkout</h1>
          </div>
        </CheckoutShell>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-bg bg-grid-medical">
      <header className="border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold tracking-tight text-heading transition-colors hover:text-primary-dark"
            translate="no"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
            >
              <rect width="18" height="18" x="3" y="3" rx="5" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <path d="M7 7h.01M17 7h.01" strokeWidth={3} strokeLinecap="round" />
            </svg>
            <span>ResidencyPhoto</span>
          </Link>
          <Link href="/#pricing" className="inline-flex items-center text-sm font-medium text-body hover:text-heading">
            <ArrowLeft aria-hidden={true} className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:py-16">{children}</div>
      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 pb-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} ResidencyPhoto</p>
        <nav aria-label="Legal" className="flex gap-5">
          <Link href="/privacy" className="hover:text-heading">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-heading">
            Terms
          </Link>
        </nav>
      </footer>
    </main>
  );
}
