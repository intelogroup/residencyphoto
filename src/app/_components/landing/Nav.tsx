"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export function Nav() {
  const session = authClient.useSession();
  const isLoggedIn = !!session.data?.user;

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pointer-events-none">
      <div className="max-w-6xl mx-auto bg-white/88 backdrop-blur-md border border-slate-200 shadow-sm rounded-full py-2.5 px-6 flex items-center justify-between pointer-events-auto transition-[background-color,border-color,box-shadow] duration-200">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <LogoIcon />
          <span translate="no" className="font-sans text-sm font-bold text-heading tracking-tight">ResidencyPhoto</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-xs font-semibold text-body">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <Link href="/auth/sign-in" className="hidden sm:inline-block font-sans text-xs font-semibold text-slate-600 hover:text-primary transition-colors cursor-pointer">
              Sign In
            </Link>
          )}
          <a
            href={isLoggedIn ? "/dashboard" : "/auth/sign-up"}
            className="inline-flex items-center justify-center bg-primary text-white hover:bg-primary-dark transition-colors duration-200 text-xs font-semibold px-6 py-2.5 rounded-full cursor-pointer"
          >
            {isLoggedIn ? "Dashboard" : "Try Free"}
          </a>
        </div>
      </div>
    </header>
  );
}

const LogoIcon = () => (
  <svg aria-hidden="true" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
    <rect width="18" height="18" x="3" y="3" rx="5" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path d="M7 7h.01M17 7h.01" strokeWidth={3} strokeLinecap="round" />
  </svg>
);
