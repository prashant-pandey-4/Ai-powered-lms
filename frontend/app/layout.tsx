import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillUP — Open-Source Developer Academy & AI LMS',
  description: 'Learn Data Structures, Web Development, and System Design with zero paywalls. Powered by Gemini 3.6 Flash AI Tutor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body className="flex min-h-full bg-[#060709] text-[#f4f4f5] dark:bg-[#060709] dark:text-[#f4f4f5] antialiased transition-colors duration-200">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AppShell>{children}</AppShell>

            {/* Global Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#111217',
                  border: '1px solid #22232a',
                  color: '#f4f4f5',
                  fontSize: '13px',
                  borderRadius: '16px',
                },
                classNames: {
                  success: 'border-[#f97316]/50 text-[#f97316]',
                  error: 'border-red-800/50 text-red-400',
                  warning: 'border-yellow-700/50 text-yellow-400',
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
