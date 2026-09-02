'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-9 w-9 rounded-full"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-all duration-300" style={{ color: '#f59e0b' }} />
      ) : (
        <Moon className="h-4 w-4 transition-all duration-300" style={{ color: '#6366f1' }} />
      )}
    </button>
  );
}
