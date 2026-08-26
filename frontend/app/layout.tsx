import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { SkillUpSidebar } from '@/components/skillup-sidebar';
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
        </body>
      </html>
    </ClerkProvider>
  );
}
