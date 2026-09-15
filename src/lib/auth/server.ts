import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import { getNeonAuthConfig } from "../auth-config";

// Lazy-load auth config to avoid evaluating at build time
let _auth: ReturnType<typeof createNeonAuth> | null = null;

function getAuth() {
  if (!_auth) {
    _auth = createNeonAuth(getNeonAuthConfig(process.env));
  }
  return _auth;
}

export const auth = new Proxy({} as ReturnType<typeof createNeonAuth>, {
  get(target, prop) {
    return getAuth()[prop as keyof ReturnType<typeof createNeonAuth>];
  },
});
