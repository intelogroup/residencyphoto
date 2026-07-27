import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import { getNeonAuthConfig } from "../auth-config";

export const auth = createNeonAuth(getNeonAuthConfig(process.env));
