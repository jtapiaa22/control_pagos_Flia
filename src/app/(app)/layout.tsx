import { requireUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/roles";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireUser();
  const admin = isAdmin(profile.role);

  return (
    <div className="min-h-screen bg-surface-page">
      <Sidebar isAdmin={admin} nombre={profile.nombre_completo} />
      <main className="mx-auto max-w-[1160px] px-4 pt-6 pb-24 md:pb-10 md:pl-[280px] md:pr-8">
        {children}
      </main>
      <BottomNav isAdmin={admin} />
    </div>
  );
}
