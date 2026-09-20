import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";
import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import { OAuthCallbackHandler } from "@/components/auth/OAuthCallbackHandler";

export const dynamicParams = false;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  return (
    <main
      id="main-content"
      className="relative min-h-screen overflow-hidden bg-bg flex flex-col items-center justify-center p-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/doctors-bg.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-white/78 backdrop-blur-[1px]" />
      <Link href="/" translate="no" className="relative z-10 mb-6 flex items-center gap-2 font-sans text-sm font-bold text-heading">
        <svg aria-hidden="true" className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
          <rect width="18" height="18" x="3" y="3" rx="5" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <path d="M7 7h.01M17 7h.01" strokeWidth={3} strokeLinecap="round" />
        </svg>
        ResidencyPhoto
      </Link>
      <div className="relative z-10 w-full flex justify-center">
        {/* Custom sign-in form: owns the submit lifecycle (client timeout,
            persistent error banner, password kept on failure). Custom OAuth
            callback handler: explicitly exchanges Neon's one-time session
            verifier for the app-domain session, with a timeout and a real
            error state instead of the vendor's infinite spinner. All other
            auth views keep the vendor AuthView. */}
        {path === "sign-in" ? (
          <SignInForm />
        ) : path === "callback" ? (
          <OAuthCallbackHandler />
        ) : (
          <AuthView path={path} redirectTo="/dashboard" />
        )}
      </div>
    </main>
  );
}
