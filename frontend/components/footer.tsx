import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 dark:bg-zinc-800">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-lg">Skill<span className="text-emerald-600">UP</span></span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              Modern e-learning platform with structured video lectures, downloadable reference notes, and 24/7 AI tutor doubt-solving assistance.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Top Categories
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li>
                <Link href="/courses" className="hover:text-slate-900 dark:hover:text-white">
                  Full Stack Web Development
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-slate-900 dark:hover:text-white">
                  System Design & Distributed Systems
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-slate-900 dark:hover:text-white">
                  Cloud Architecture & DevOps
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-slate-900 dark:hover:text-white">
                  AI & Applied Machine Learning
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Learning Hub
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li>
                <Link href="/courses" className="hover:text-slate-900 dark:hover:text-white">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">
                  My Enrolled Courses
                </Link>
              </li>
              <li>
                <Link href="/instructor" className="hover:text-slate-900 dark:hover:text-white">
                  Instructor Studio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Instructors
            </h4>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              Create video modules, upload resources, set pricing, and reach motivated learners.
            </p>
            <div className="mt-4">
              <Link
                href="/instructor/courses/new"
                className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Create a Course
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-600">
          © {new Date().getFullYear()} SkillUP Platform. Open Source E-Learning Architecture.
        </div>
      </div>
    </footer>
  );
}
