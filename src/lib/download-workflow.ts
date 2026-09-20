interface AuthorizePhotoDownloadOptions {
  request: () => Promise<Response>;
  openCheckout: () => void;
}

export type DownloadAuthorization =
  | { allowed: true }
  | { allowed: false; forbidden: true };

export async function authorizePhotoDownload({
  request,
  openCheckout,
}: AuthorizePhotoDownloadOptions): Promise<DownloadAuthorization> {
  const response = await request();
  const entitlement = (await response.json()) as { error?: string };

  if (response.status === 403) {
    openCheckout();
    return { allowed: false, forbidden: true };
  }

  if (!response.ok) {
    throw new Error(entitlement.error ?? "We could not authorize this download.");
  }

  return { allowed: true };
}
