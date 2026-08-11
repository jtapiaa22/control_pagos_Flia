import { requireUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/roles";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireUser();
  const admin = isAdmin(profile.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <DesktopNav isAdmin={admin} nombre={profile.nombre_completo} />
      <main className="mx-auto max-w-4xl px-4 pt-6 pb-24 md:pb-10">
        {children}
      </main>
      <BottomNav isAdmin={admin} />
    </div>
  );
}
