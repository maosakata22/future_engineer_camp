import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/session";

export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const staffSession = await getStaffSession();

  if (!staffSession) {
    redirect("/login?next=/staff");
  }

  return children;
}
