"use client";

import React, { useState } from "react";
import { Mail, MessageSquareText } from "lucide-react";
import { Modal } from "@/components/Modal";
import { buildSupportMailto } from "@/lib/support-email";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
  user: { email: string; plan?: "Free" | "Resident" | "Program" };
}

const SUPPORT_EMAIL = "support@residencyphoto.com";

type SendState = "idle" | "sending" | "sent" | "error";

export function SupportModal({ open, onClose, user }: SupportModalProps) {
  const [topic, setTopic] = useState("Technical issue");
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState(user.email);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const mailtoHref = buildSupportMailto({
    topic,
    message,
    replyEmail,
    page: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "",
    plan: user.plan ?? "Free",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendState("sending");
    setErrorMessage("");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          message,
          replyEmail,
          page: `${window.location.pathname}${window.location.search}`,
          plan: user.plan ?? "Free",
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "We could not send your message.");
      }
      setSendState("sent");
      setMessage("");
    } catch (error) {
      setSendState("error");
      setErrorMessage(error instanceof Error ? error.message : "We could not send your message.");
    }
  };

  const handleClose = () => {
    setTopic("Technical issue");
    setMessage("");
    setSendState("idle");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareText aria-hidden={true} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-heading">Help & Feedback</h2>
          <p className="mt-1 text-sm leading-5 text-muted">Report a problem, ask a question, or suggest an improvement.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="support-topic" className="form-label">Topic</label>
          <select
            id="support-topic"
            name="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="form-input mt-1.5 bg-white"
          >
            <option>Technical issue</option>
            <option>Billing question</option>
            <option>Product feedback</option>
            <option>Privacy question</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="support-message" className="form-label">Message</label>
          <textarea
            id="support-message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            autoComplete="off"
            placeholder="Tell us what happened or what you would like to improve…"
            className="form-input mt-1.5 resize-y"
          />
        </div>

        <div>
          <label htmlFor="support-reply-email" className="form-label">Reply Email</label>
          <input
            id="support-reply-email"
            name="replyEmail"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            value={replyEmail}
            onChange={(event) => setReplyEmail(event.target.value)}
            className="form-input mt-1.5"
          />
        </div>

        <p className="text-xs leading-5 text-muted">Your current page and plan are included for context. Photos and account identifiers are never attached.</p>

        {sendState === "sent" && (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary-dark">Message sent — we&apos;ll reply to {replyEmail}.</p>
        )}
        {sendState === "error" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage} You can also{" "}
            <a href={mailtoHref} className="underline">email us directly</a>.
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary-dark hover:text-primary">
            <Mail aria-hidden={true} className="h-4 w-4" />
            {SUPPORT_EMAIL}
          </a>
          <div className="flex gap-3">
            <button type="button" onClick={handleClose} className="btn-ghost px-4 py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={sendState === "sending"} className="btn-primary px-4 py-2.5 text-sm disabled:opacity-60">
              {sendState === "sending" ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
