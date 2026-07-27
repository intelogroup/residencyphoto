import { Resend } from "resend";
import { auth } from "@/lib/auth/server";
import { checkSupportRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// ponytail: Resend sandbox only delivers to the account owner's address until
// residencyphoto.com is verified as a domain there — swap SUPPORT_INBOX_EMAIL
// to support@residencyphoto.com once that's done.
const SUPPORT_INBOX = process.env.SUPPORT_INBOX_EMAIL || "support@residencyphoto.com";
const TOPICS = ["Technical issue", "Billing question", "Product feedback", "Privacy question", "Other"];

interface SupportRequestBody {
  topic?: unknown;
  message?: unknown;
  replyEmail?: unknown;
  page?: unknown;
  plan?: unknown;
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Please sign in before sending feedback." }, { status: 401 });
  }

  const { success } = await checkSupportRateLimit(session.user.id);
  if (!success) {
    return Response.json({ error: "Too many messages. Try again shortly." }, { status: 429 });
  }

  let payload: SupportRequestBody;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { topic, message, replyEmail, page, plan } = payload;
  if (typeof topic !== "string" || !TOPICS.includes(topic)) {
    return Response.json({ error: "Please choose a valid topic." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim() || message.length > 4000) {
    return Response.json({ error: "Message must be between 1 and 4000 characters." }, { status: 400 });
  }
  if (typeof replyEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) {
    return Response.json({ error: "Please provide a valid reply email." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return Response.json({ error: "Support email is not configured." }, { status: 500 });
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ResidencyPhoto <onboarding@resend.dev>",
      to: SUPPORT_INBOX,
      replyTo: replyEmail,
      subject: `[ResidencyPhoto] ${topic}`,
      text: [
        message.trim(),
        "",
        "Account context",
        `Reply email: ${replyEmail}`,
        `Page: ${typeof page === "string" ? page : "unknown"}`,
        `Plan: ${typeof plan === "string" ? plan : "unknown"}`,
        `User ID: ${session.user.id}`,
      ].join("\n"),
    });

    if (error) {
      console.error("Unable to send support email", error);
      return Response.json({ error: "We could not send your message. Please email us directly." }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to send support email", error);
    return Response.json({ error: "We could not send your message. Please email us directly." }, { status: 500 });
  }
}
