import { exportApplicantData } from "@/db/applicant-profiles";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const data = await exportApplicantData(session.user.id);
  return Response.json({
    user: { id: session.user.id, email: session.user.email, name: session.user.name },
    ...data,
  });
}
