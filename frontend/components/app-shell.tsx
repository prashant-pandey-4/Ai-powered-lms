'use client';
import { usePathname } from 'next/navigation';
import { SkillUpSidebar } from '@/components/skillup-sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import { SkillUpFooter } from '@/components/skillup-footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isLearnRoute = pathname.includes('/learn');
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <div className="flex min-h-screen flex-col bg-app min-w-0">
        <main className="flex-1">{children}</main>
        <SkillUpFooter />
      </div>
    );
  }

  return (
    <>
      {/* Conditionally Render Dedicated Sidebar */}
      {isAdminRoute ? <AdminSidebar /> : <SkillUpSidebar />}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
        <main className="flex-1">{children}</main>
        {!isAdminRoute && !isLearnRoute && <SkillUpFooter />}
      </div>
    </>
  );
}

