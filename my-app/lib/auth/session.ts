import { headers } from "next/headers";
import { auth } from "@/auth";
import { staffQueries } from "@/lib/db/queries";

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getStaffSession() {
  const session = await getAuthSession();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const staffMember = await staffQueries.getActiveByEmail(email);
  if (!staffMember) {
    return null;
  }

  return {
    session,
    staffMember,
  };
}

export async function getStaffSessionFromHeaders(requestHeaders: Headers) {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const staffMember = await staffQueries.getActiveByEmail(email);
  if (!staffMember) {
    return null;
  }

  return {
    session,
    staffMember,
  };
}
