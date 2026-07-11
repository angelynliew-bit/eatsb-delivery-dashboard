import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { getAuthContext } from "@/lib/auth/server";
import { navigationItems } from "@/lib/navigation";

export default async function ProtectedDashboardPage({ section }: { section: string }) {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const item = navigationItems.find((navItem) => navItem.section === section);
  if (item && !context.permissions[item.permission]) {
    redirect("/");
  }

  return <DashboardShell initialSection={section} />;
}
