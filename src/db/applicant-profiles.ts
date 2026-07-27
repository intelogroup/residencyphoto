import "server-only";

import { eq, sql } from "drizzle-orm";
import { getDatabase } from "./index";
import { applicantProfiles, photoRecords } from "./schema";
import type { StripePlanName } from "../lib/stripe-plans";
import { getDownloadEntitlement } from "../lib/download-entitlement";

type Database = ReturnType<typeof getDatabase>;

export async function getStripeCustomerId(
  userId: string,
  database: Database = getDatabase(),
): Promise<string | null> {
  const [profile] = await database
    .select({ stripeCustomerId: applicantProfiles.stripeCustomerId })
    .from(applicantProfiles)
    .where(eq(applicantProfiles.userId, userId))
    .limit(1);

  return profile?.stripeCustomerId ?? null;
}

export async function getApplicantPlan(
  userId: string,
  database: Database = getDatabase(),
): Promise<"Free" | StripePlanName> {
  const [profile] = await database
    .select({ plan: applicantProfiles.plan })
    .from(applicantProfiles)
    .where(eq(applicantProfiles.userId, userId))
    .limit(1);

  return profile?.plan ?? "Free";
}

export async function saveStripeCustomerId(
  userId: string,
  stripeCustomerId: string,
  database: Database = getDatabase(),
): Promise<void> {
  await database
    .insert(applicantProfiles)
    .values({ userId, stripeCustomerId })
    .onConflictDoUpdate({
      target: applicantProfiles.userId,
      set: { stripeCustomerId, updatedAt: new Date() },
    });
}

export async function activateApplicantPlan(
  userId: string,
  plan: StripePlanName,
  stripeCustomerId: string,
  database: Database = getDatabase(),
): Promise<void> {
  await database
    .insert(applicantProfiles)
    .values({ userId, plan, stripeCustomerId })
    .onConflictDoUpdate({
      target: applicantProfiles.userId,
      set: { plan, stripeCustomerId, updatedAt: new Date() },
    });
}

export async function claimApplicantDownload(
  userId: string,
  database: Database = getDatabase(),
): Promise<{ allowed: boolean; plan: "Free" | StripePlanName; remaining: number | null }> {
  const plan = await getApplicantPlan(userId, database);
  const entitlement = getDownloadEntitlement(plan);
  if (!entitlement.allowed) return { ...entitlement, plan };

  const rows = await database.execute<{
    plan: StripePlanName;
    download_count: number;
  }>(sql`
    UPDATE ${applicantProfiles}
    SET download_count = ${applicantProfiles.downloadCount} + 1,
        updated_at = NOW()
    WHERE ${applicantProfiles.userId} = ${userId}
      AND ${applicantProfiles.plan} <> 'Free'
    RETURNING plan, download_count
  `);

  const claimed = rows.rows[0];
  if (!claimed) return { allowed: false, plan: "Free", remaining: 0 };
  return {
    allowed: true,
    plan: claimed.plan,
    remaining: null,
  };
}

export async function exportApplicantData(
  userId: string,
  database: Database = getDatabase(),
) {
  const [profile] = await database
    .select()
    .from(applicantProfiles)
    .where(eq(applicantProfiles.userId, userId))
    .limit(1);
  const photos = await database
    .select()
    .from(photoRecords)
    .where(eq(photoRecords.userId, userId));

  return { profile: profile ?? null, photoRecords: photos };
}

export async function deleteApplicantData(
  userId: string,
  database: Database = getDatabase(),
): Promise<void> {
  await database.delete(photoRecords).where(eq(photoRecords.userId, userId));
  await database.delete(applicantProfiles).where(eq(applicantProfiles.userId, userId));
}
