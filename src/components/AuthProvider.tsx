"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { authClient } from "@/lib/auth/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Absolute origin so the vendor AuthView builds absolute OAuth callbackURLs
  // (Neon requires a trusted domain in production). Resolved via
  // useSyncExternalStore, not by reading `window` during render: `window`
  // doesn't exist when Next.js prerenders pages on the server, and reading it
  // there crashes the production build (ReferenceError: window is not
  // defined). Server and first client render both use "", so there's no
  // hydration mismatch; the real origin applies right after hydration, before
  // any OAuth button can be clicked.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      account={{ fields: ["name"] }}
      basePath="/auth"
      baseURL={origin}
      credentials={{ forgotPassword: true }}
      defaultTheme="light"
      Link={Link}
      navigate={router.push}
      onSessionChange={() => router.refresh()}
      redirectTo="/dashboard"
      replace={router.replace}
      signUp={{ fields: ["name"] }}
      social={{ providers: ["google"] }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
