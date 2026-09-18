"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (response.ok && data.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <p className="font-sans text-sm text-primary-dark font-semibold">
        You&rsquo;re on the list — check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="newsletter-email" className="font-sans text-xs font-semibold text-heading uppercase tracking-wide">
        ERAS photo tips, monthly
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          disabled={status === "sending"}
          className="font-sans text-sm rounded-lg border border-border bg-white px-3 py-2 w-full max-w-xs text-heading placeholder:text-muted focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="font-sans text-sm font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-60 transition-colors rounded-lg px-4 py-2 shrink-0"
        >
          {status === "sending" ? "Joining…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && <p className="font-sans text-xs text-error">{message}</p>}
    </form>
  );
}
