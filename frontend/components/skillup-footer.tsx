import Link from 'next/link';
import { Flame, Mail, Phone, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';


export function SkillUpFooter() {
  return (
    <footer className="w-full border-t border-app bg-card/60 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 space-y-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/20 transition-transform group-hover:scale-105">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight flex items-center gap-1 text-app">
                  Skill<span className="text-[#f97316]">UP</span>
                </span>
                <p className="text-[10px] font-semibold text-muted">Open-Source Developer Academy</p>
              </div>
            </Link>

            <p className="text-xs text-muted leading-relaxed max-w-sm">
              Empowering engineers worldwide with{' '}
              <strong style={{ color: '#f97316' }}>A Structured, AI-Powered Learning Experience</strong>.
              Zero-paywall computer science syllabus, real-time in-player AI mentoring, and downloadable technical notes.
            </p>

            {/* Direct Contact Links: Email, Phone, WhatsApp */}
            <div className="space-y-2 pt-1">
              <a
                href="mailto:support@skillup.dev"
                className="flex items-center gap-2.5 text-xs text-muted hover:text-[#f97316] transition-colors group"
                title="Send an email to SkillUP Support"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card-2 border border-app group-hover:border-[#f97316]/40 text-[#f97316]">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span>support@skillup.dev</span>
              </a>

              <a
                href="tel:+918000000000"
                className="flex items-center gap-2.5 text-xs text-muted hover:text-[#f97316] transition-colors group"
                title="Call SkillUP Student Support"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card-2 border border-app group-hover:border-[#f97316]/40 text-[#f59e0b]">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>+91 80000 00000 (Toll Free / Helpline)</span>
              </a>

              <a
                href="https://wa.me/918000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-muted hover:text-emerald-400 transition-colors group"
                title="Chat on WhatsApp"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card-2 border border-app group-hover:border-emerald-500/40 text-emerald-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <span>WhatsApp Community Support ↗</span>
              </a>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-app">Explore</p>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/courses" className="hover:text-app transition-colors">
                  All Courses & Tracks
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-app transition-colors">
                  Knowledge Hub
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-app transition-colors">
                  My Learning Room
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-app transition-colors">
                  Academy Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Popular Tracks */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-app">Top Curriculums</p>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/courses?search=dsa" className="hover:text-app transition-colors">
                  DSA & Competitive Coding
                </Link>
              </li>
              <li>
                <Link href="/courses?search=system+design" className="hover:text-app transition-colors">
                  System Design & Architecture
                </Link>
              </li>
              <li>
                <Link href="/courses?search=react" className="hover:text-app transition-colors">
                  Full-Stack Next.js & Node
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-app transition-colors">
                  Backend First Principles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Trust */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-app">Transparency</p>
            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Free Forever
              </li>
              <li>
                <span className="text-subtle text-[11px]">No Credit Card Required</span>
              </li>
              <li>
                <span className="text-subtle text-[11px]">Open-Source CC BY 4.0</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 border-t border-app flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p className="flex items-center gap-1">
            &copy; {new Date().getFullYear()} SkillUP Academy. Built with passion for open education.
          </p>
          <div className="flex items-center gap-4 text-subtle">
            <span className="hover:text-muted cursor-default">Privacy</span>
            <span>&middot;</span>
            <span className="hover:text-muted cursor-default">Terms</span>
            <span>&middot;</span>
            <span className="hover:text-muted cursor-default">Open-Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
