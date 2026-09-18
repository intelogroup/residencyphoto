import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { newsletterSubscribers } from "@/db/schema";

export const runtime = "nodejs";

// One-click unsubscribe link used in newsletter broadcasts:
//   https://residencyphoto.com/api/newsletter/unsubscribe?email=user@example.com
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response("Invalid email address.", { status: 400 });
  }

  try {
    const db = getDatabase();
    await db
      .update(newsletterSubscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.email, email));
  } catch (error) {
    console.error("Unable to process newsletter unsubscribe", error);
    return new Response("Something went wrong. Please try again.", { status: 500 });
  }

  return new Response("You've been unsubscribed. You won't receive further newsletter emails.", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
