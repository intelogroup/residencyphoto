import { Resend } from "resend";
import { getDatabase } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { checkNewsletterRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = process.env.RESEND_FROM_EMAIL || "ResidencyPhoto <onboarding@resend.dev>";

interface SubscribeBody {
  email?: unknown;
  source?: unknown;
}

export async function POST(request: Request) {
  const { success } = await checkNewsletterRateLimit(getClientIp(request));
  if (!success) {
    return Response.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let payload: SubscribeBody;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const source = typeof payload.source === "string" ? payload.source.slice(0, 64) : "footer";

  try {
    const db = getDatabase();
    await db
      .insert(newsletterSubscribers)
      .values({ email, source })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { unsubscribedAt: null, source },
      });
  } catch (error) {
    console.error("Unable to save newsletter subscription", error);
    return Response.json({ error: "We could not save your subscription. Please try again." }, { status: 500 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "You're on the ResidencyPhoto list",
        text: [
          "Thanks for subscribing to the ResidencyPhoto newsletter.",
          "You'll get ERAS photo guides, spec updates, and residency application tips.",
          "",
          "If you didn't sign up, just ignore this email.",
        ].join("\n"),
      });
    } catch (error) {
      console.error("Unable to send newsletter confirmation", error);
      // Subscription is saved; the confirmation email is best-effort.
    }
  }

  return Response.json({ ok: true });
}
