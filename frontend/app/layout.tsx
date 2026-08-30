import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { SkillUpSidebar } from '@/components/skillup-sidebar';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillUP — Modern E-Learning & AI LMS',
  description: 'Sleek dark e-learning platform with video courses, live schedule, and instant AI tutor doubt solving.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark h-full">
        <body className="flex min-h-full bg-[#0d0d10] text-[#f4f4f5] antialiased">
          {/* Left Fixed Sidebar */}
          <SkillUpSidebar />

          {/* Main App Content Area */}
          <div className="flex flex-1 flex-col lg:pl-64">
            <main className="flex-1 pb-16">{children}</main>
          </div>

          {/* Global Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#16161a',
                border: '1px solid #23232a',
                color: '#f4f4f5',
                fontSize: '13px',
                borderRadius: '12px',
              },
              classNames: {
                success: 'border-[#d4f76d]/40',
                error: 'border-red-800/40',
                warning: 'border-yellow-700/40',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
