'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpSidebar } from '@/components/skillup-sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import { SkillUpFooter } from '@/components/skillup-footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  const isAdminRoute = pathname.startsWith('/admin');
  const isLearnRoute = pathname.includes('/learn');
  const isLandingRoute = pathname === '/landing';

  // Landing page layout (standalone full-width, no sidebar) is used for:
  // 1. The dedicated /landing route
  // 2. The root "/" route ONLY when the user is not signed in
  const isLandingLayout = isLandingRoute || (pathname === '/' && isLoaded && !isSignedIn);

  if (isLandingLayout) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-app">
        <main className="flex-1 w-full">{children}</main>
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
