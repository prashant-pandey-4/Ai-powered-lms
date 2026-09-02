import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillUP — Open-Source Developer Academy & AI LMS',
  description: 'Learn Data Structures, Web Development, and System Design with zero paywalls. Powered by AI Tutor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body className="flex min-h-full antialiased" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AppShell>{children}</AppShell>

            {/* Global Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  borderRadius: '16px',
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
