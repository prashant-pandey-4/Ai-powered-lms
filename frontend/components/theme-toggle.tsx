'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full border border-[#22232a] bg-[#111217]" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#22232a] bg-[#111217] dark:bg-[#111217] dark:border-[#22232a] light:bg-[#f1f5f9] light:border-[#e2e8f0] text-[#9ca3af] hover:text-[#f97316] hover:border-[#f97316]/50 transition-all duration-200"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#f59e0b] transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[#475569] transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
