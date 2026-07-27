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
