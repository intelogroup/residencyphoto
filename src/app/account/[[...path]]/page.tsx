import { AccountView } from "@neondatabase/auth-ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const view = path?.[0] ?? "settings";

  return (
    <main id="main-content" className="min-h-screen bg-bg p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="mb-6 inline-flex text-sm font-semibold text-primary hover:underline">
          Back to dashboard
        </Link>
        <AccountView path={view} />
      </div>
    </main>
  );
}
