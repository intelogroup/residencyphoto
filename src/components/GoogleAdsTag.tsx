"use client";

import Script from "next/script";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Ads global site tag (gtag.js). Renders nothing when
 * NEXT_PUBLIC_GOOGLE_ADS_ID is unset. Mirrors the MetaPixel component.
 */
export function GoogleAdsTag() {
  if (!ADS_ID) return null;
  return (
    <>
      <Script
        id="google-ads-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
      />
      <Script
        id="google-ads-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ADS_ID}');`,
        }}
      />
    </>
  );
}

/**
 * Fires a Google Ads purchase conversion. No-op when the tag or the
 * conversion label env var is missing, or when gtag hasn't loaded yet.
 */
export function trackGoogleAdsPurchase(opts: {
  sessionId: string;
  value: number;
  currency?: string;
}) {
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim();
  if (!ADS_ID || !label) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: `${ADS_ID}/${label}`,
    value: opts.value,
    currency: opts.currency ?? "USD",
    transaction_id: opts.sessionId,
  });
}
