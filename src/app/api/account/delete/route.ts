import { deleteApplicantData } from "@/db/applicant-profiles";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

// Deletes this app's own rows (applicant_profiles, photo_records) for the
// signed-in user. Deleting the Neon Auth identity itself is a separate call
// the client makes via authClient.deleteUser() after this succeeds.
export async function POST() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    await deleteApplicantData(session.user.id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to delete applicant data", error);
    return Response.json({ error: "We could not delete your data. Please try again." }, { status: 500 });
  }
}
