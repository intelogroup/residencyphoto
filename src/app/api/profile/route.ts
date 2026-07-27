import { getApplicantPlan } from "@/db/applicant-profiles";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    return Response.json({ plan: await getApplicantPlan(session.user.id) });
  } catch (error) {
    console.error("Unable to load applicant profile", error);
    return Response.json({ error: "We could not load your profile." }, { status: 500 });
  }
}
