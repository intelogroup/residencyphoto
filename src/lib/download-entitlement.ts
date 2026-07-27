export type ApplicantPlan = "Free" | "Resident" | "Program";

export function getDownloadEntitlement(plan: ApplicantPlan) {
  if (plan !== "Free") return { allowed: true, remaining: null } as const;
  return { allowed: false, remaining: 0 } as const;
}
