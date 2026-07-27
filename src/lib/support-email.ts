export interface SupportEmailInput {
  topic: string;
  message: string;
  replyEmail: string;
  page: string;
  plan: string;
}

export function buildSupportMailto({
  topic,
  message,
  replyEmail,
  page,
  plan,
}: SupportEmailInput): string {
  const subject = `[ResidencyPhoto] ${topic}`;
  const body = [
    message.trim(),
    "",
    "Account context",
    `Reply email: ${replyEmail.trim()}`,
    `Page: ${page}`,
    `Plan: ${plan}`,
  ].join("\n");

  return `mailto:support@residencyphoto.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
