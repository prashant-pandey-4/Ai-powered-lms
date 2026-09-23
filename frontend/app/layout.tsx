import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SkillUP — Open-Source Developer Academy & AI LMS',
    template: '%s | SkillUP',
  },
  description: 'Master Data Structures, Full-Stack Web Development, System Design, and AI Engineering with zero paywalls. Free interactive video syllabus, 24/7 AI mentor, and study notes.',
  applicationName: 'SkillUP',
  keywords: [
    'AI LMS',
    'Developer Academy',
    'Data Structures & Algorithms',
    'System Design',
    'Full Stack Development',
    'Free Coding Courses',
    'AI Tutor',
    'Next.js LMS',
    'Open Source Education',
  ],
  authors: [{ name: 'SkillUP Team', url: 'https://skillup.dev' }],
  creator: 'SkillUP',
  publisher: 'SkillUP',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skillup.dev',
    title: 'SkillUP — Open-Source Developer Academy & AI LMS',
    description: 'Learn tech with zero paywalls. Video syllabus, 24/7 AI mentor, and developer guides.',
    siteName: 'SkillUP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillUP — Open-Source Developer Academy & AI LMS',
    description: 'Master Data Structures, Web Development, and System Design with zero paywalls.',
    creator: '@skillup_dev',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body className="flex w-full min-h-full antialiased" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
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
