import type { EraUser } from "./eras-storage";

interface NeonSessionUser {
  id: string;
  email: string;
  name?: string | null;
  createdAt?: Date | string | null;
}

interface NeonSession {
  user: NeonSessionUser;
}

function fallbackName(email: string): string {
  const prefix = email.split("@")[0] || "Applicant";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export function mapNeonSessionToEraUser(session: NeonSession | null | undefined): EraUser | null {
  if (!session?.user) return null;

  const { user } = session;
  return {
    authId: user.id,
    email: user.email,
    name: user.name?.trim() || fallbackName(user.email),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
  };
}

export function getPostAuthRedirect(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
