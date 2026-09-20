"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      account={{ fields: ["name"] }}
      basePath="/auth"
      // No baseURL: the vendor builds OAuth callbackURLs as
      // `${baseURL}/dashboard`, and Neon's Managed Better Auth only honors a
      // relative callbackURL — it appends the one-time
      // `neon_auth_session_verifier` to it after OAuth so the client can
      // exchange it for the session via /api/auth. An absolute origin here
      // is ignored by the backend (users land on /auth/callback with no
      // verifier and never get a session).
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
