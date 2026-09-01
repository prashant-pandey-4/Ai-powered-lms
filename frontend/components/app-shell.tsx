'use client';

import { usePathname } from 'next/navigation';
import { SkillUpSidebar } from '@/components/skillup-sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {/* Conditionally Render Dedicated Sidebar */}
      {isAdminRoute ? <AdminSidebar /> : <SkillUpSidebar />}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </>
  );
}
