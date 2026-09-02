'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Search, Flame, ArrowRight, BookOpen, Sparkles, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useDebounce } from '@/lib/use-debounce';
import { getSmartSearchSuggestions, SearchSuggestionResult } from '@/lib/search-suggestions';
import { fetchApi } from '@/lib/api';

interface SkillUpHeaderProps {
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function SkillUpHeader({
  title = 'Explore & Learn',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search DSA, React, System Design...',
}: SkillUpHeaderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [localQuery, setLocalQuery] = useState('');
  const currentQuery = onSearchChange ? (searchValue ?? '') : localQuery;

  // Debounced query for suggestions
  const debouncedQuery = useDebounce(currentQuery, 200);

  // Dropdown state
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [cachedCourses, setCachedCourses] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestionResult>({
    keywordSuggestions: [],
    matchedCourses: [],
    relatedTags: [],
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cached courses once for fast local fuzzy matching
  useEffect(() => {
    let isMounted = true;
    async function loadQuickCourses() {
      try {
        const res = await fetchApi<any[]>('/courses');
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCachedCourses(res.data);
        }
      } catch {
        // Silent fallback to keyword suggestions
      }
    }
    loadQuickCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update suggestions whenever debounced query changes
  useEffect(() => {
    const result = getSmartSearchSuggestions(debouncedQuery, cachedCourses);
    setSuggestions(result);
    setSelectedIndex(-1);
  }, [debouncedQuery, cachedCourses]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQueryChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalQuery(val);
    }
  };

  const executeSearch = useCallback((term: string) => {
    setIsFocused(false);
    const cleanTerm = term.trim();
    if (onSearchChange) {
      onSearchChange(cleanTerm);
      return;
    }
    if (cleanTerm) {
      router.push(`/courses?search=${encodeURIComponent(cleanTerm)}`);
    } else {
      router.push('/courses');
    }
  }, [onSearchChange, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestions.keywordSuggestions.length) {
      executeSearch(suggestions.keywordSuggestions[selectedIndex]);
    } else {
      executeSearch(currentQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalKeywords = suggestions.keywordSuggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isFocused) {
        setIsFocused(true);
        return;
      }
      setSelectedIndex((prev) => (prev < totalKeywords - 1 ? prev + 1 : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : totalKeywords - 1));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = isFocused && (suggestions.keywordSuggestions.length > 0 || suggestions.matchedCourses.length > 0);

  return (
    <header
      className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-6 backdrop-blur-xl lg:px-8"
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'color-mix(in srgb, var(--bg) 90%, transparent)',
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black tracking-tight sm:text-2xl" style={{ color: 'var(--text)' }}>
          {title}
        </h1>
      </div>

      {/* YouTube-Grade Interactive Search Bar */}
      <div ref={searchContainerRef} className="hidden md:flex relative w-80 lg:w-105 items-center">
        <form onSubmit={handleSubmit} className="relative w-full flex items-center">
          <Search className="absolute left-4 h-4 w-4 pointer-events-none transition-colors" style={{ color: isFocused ? 'var(--primary)' : 'var(--text-subtle)' }} />
          <input
            ref={inputRef}
            type="text"
            value={currentQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="transition-all duration-200"
            style={{
              height: '2.75rem',
              width: '100%',
              borderRadius: '9999px',
              border: `1px solid ${isFocused ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: 'var(--bg-card)',
              paddingLeft: '2.75rem',
              paddingRight: currentQuery ? '2.5rem' : '1rem',
              fontSize: '0.75rem',
              color: 'var(--text)',
              outline: 'none',
              boxShadow: isFocused ? '0 0 20px -3px rgba(249, 115, 22, 0.2)' : 'none',
            }}
          />
          {currentQuery && (
            <button
              type="button"
              onClick={() => {
                handleQueryChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-3.5 flex h-5 w-5 items-center justify-center rounded-full text-xs transition-colors hover:bg-card-2"
              style={{ color: 'var(--text-subtle)' }}
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* YouTube-Style Related Suggestions Dropdown */}
        {showDropdown && (
          <div
            className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-2xl shadow-2xl animate-in fade-in-50 slide-in-from-top-2 duration-150 z-50"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
            }}
          >
            {/* Quick Related Topic Tags */}
            {suggestions.relatedTags.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-app overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 pr-1 shrink-0">
                  <Sparkles className="h-3 w-3 text-[#f97316]" /> Topics:
                </span>
                {suggestions.relatedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleQueryChange(tag);
                      executeSearch(tag);
                    }}
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-card-2)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Keyword Search Suggestions */}
            <div className="py-1">
              <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                  {currentQuery ? (
                    <>Related Searches</>
                  ) : (
                    <>
                      <Flame className="h-3 w-3 text-[#f97316] fill-current" />
                      Trending on SkillUP
                    </>
                  )}
                </p>
              </div>

              {suggestions.keywordSuggestions.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleQueryChange(item);
                      executeSearch(item);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors"
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-card-2)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-subtle)' }} />
                      <span className="truncate">{item}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-subtle)' }} />
                  </button>
                );
              })}
            </div>

            {/* Direct Course Matches Preview */}
            {suggestions.matchedCourses.length > 0 && (
              <div className="border-t border-app pt-2 pb-2 bg-card-2/50">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-[#f97316]" /> Course Matches
                </p>
                <div className="space-y-1 px-1.5">
                  {suggestions.matchedCourses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.id}`}
                      onMouseDown={() => setIsFocused(false)}
                      className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-card group"
                    >
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="h-9 w-14 rounded-lg object-cover border border-app shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-14 rounded-lg bg-card border border-app flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-subtle" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-app truncate group-hover:text-[#f97316] transition-colors">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-muted flex items-center gap-2">
                          <span className="text-[#f97316] font-semibold">{c.category || 'Course'}</span>
                          <span>&bull;</span>
                          <span>{c._count?.lectures || 0} Lessons</span>
                        </p>
                      </div>
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-[#f97316]/15 text-[#f97316] shrink-0">
                        View &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-app flex items-center justify-between text-[10px] text-muted">
              <span>Press <kbd className="px-1 py-0.5 rounded border border-app bg-card-2 text-[9px] font-mono text-app">Enter</kbd> to search</span>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeSearch(currentQuery);
                }}
                className="font-bold text-[#f97316] hover:underline"
              >
                View all results &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right User Area & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Theme Toggle */}
        <ThemeToggle />

        {!isLoaded ? (
          <div className="h-10 w-28 animate-pulse rounded-full" style={{ backgroundColor: 'var(--bg-card)' }} />
        ) : isSignedIn ? (
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div
              className="flex items-center gap-2.5 rounded-full p-1.5 pr-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <img
                src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user?.fullName || 'User'}
                className="h-7 w-7 rounded-full object-cover"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none" style={{ color: 'var(--text)' }}>
                  {user?.fullName || 'Student'}
                </p>
                <p className="text-[10px] leading-none mt-1 font-semibold" style={{ color: 'var(--primary)' }}>
                  Free Student
                </p>
              </div>
            </div>

            <div className="ml-1">
              <UserButton />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="rounded-full px-4 py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full glow-amber-btn px-5 py-2 text-xs font-bold text-white transition-all">
                Get Started Free
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
}
