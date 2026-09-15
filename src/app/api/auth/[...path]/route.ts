import { auth } from "@/lib/auth/server";

// Lazy-load handler methods to avoid evaluating auth config at build time
const handler = () => auth.handler();

export const GET = (...args: Parameters<ReturnType<typeof handler>["GET"]>) => handler().GET(...args);
export const POST = (...args: Parameters<ReturnType<typeof handler>["POST"]>) => handler().POST(...args);
export const PUT = (...args: Parameters<ReturnType<typeof handler>["PUT"]>) => handler().PUT(...args);
export const DELETE = (...args: Parameters<ReturnType<typeof handler>["DELETE"]>) => handler().DELETE(...args);
export const PATCH = (...args: Parameters<ReturnType<typeof handler>["PATCH"]>) => handler().PATCH(...args);
