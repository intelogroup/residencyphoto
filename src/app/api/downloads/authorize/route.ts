import { claimApplicantDownload } from "@/db/applicant-profiles";
import { auth } from "@/lib/auth/server";
import { checkDownloadRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { success } = await checkDownloadRateLimit(session.user.id);
  if (!success) {
    return Response.json({ error: "Too many download attempts. Try again shortly." }, { status: 429 });
  }

  try {
    const entitlement = await claimApplicantDownload(session.user.id);
    if (!entitlement.allowed) {
      return Response.json(
        { ...entitlement, error: "Upgrade for $4 to download your ERAS-ready photo." },
        { status: 403 },
      );
    }
    return Response.json(entitlement);
  } catch (error) {
    console.error("Unable to authorize photo download", error);
    return Response.json({ error: "We could not authorize this download. Please try again." }, { status: 500 });
  }
}
