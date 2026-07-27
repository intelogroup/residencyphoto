import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

function isAdminEmail(email: string): boolean {
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

export async function GET() {
  const { data: session } = await auth.getSession();
  const email = session?.user?.email;
  if (!email || !isAdminEmail(email)) {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  return Response.json({ ok: true });
}
