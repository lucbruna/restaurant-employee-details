import { redirect } from 'next/navigation';
import { AppShell } from "@/components/layout/app-shell";
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <AppShell>
      <div className="relative flex min-h-full flex-col">
        {children}
      </div>
    </AppShell>
  );
}
