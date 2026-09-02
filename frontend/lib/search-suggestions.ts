/**
 * SkillUP Smart Search Engine & Related Suggestions (YouTube-style)
 */

export interface SearchSuggestionResult {
  keywordSuggestions: string[];
  matchedCourses: any[];
  relatedTags: string[];
}

export const TRENDING_SEARCHES = [
  'Striver A2Z DSA Sheet',
  'Namaste JavaScript Deep Dive',
  'React 19 & Next.js Full Stack',
  'System Design (HLD & LLD)',
  'Dynamic Programming in C++',
  'Graph Algorithms & Trees',
  'Node.js & Backend Architecture',
  'PostgreSQL Database & Prisma',
];

export const SYNONYM_TOPIC_MAP: Record<string, string[]> = {
  dsa: [
    'Data Structures & Algorithms',
    'Striver A2Z DSA Sheet',
    'C++ Basics & STL',
    'Dynamic Programming Mastery',
    'Trees, Graphs & Recursion',
    'LeetCode Patterns',
  ],
  algo: [
    'Data Structures & Algorithms',
    'Sorting & Searching Algorithms',
    'Graph Traversal (BFS / DFS)',
    'Dynamic Programming Patterns',
  ],
  react: [
    'React 19 & Next.js Full Stack',
    'Namaste React Series',
    'React Hooks & State Management',
    'Frontend Machine Coding',
  ],
  next: [
    'Next.js 15 App Router',
    'Server Actions & SSR',
    'Full Stack Web Applications',
  ],
  js: [
    'Namaste JavaScript Deep Dive',
    'Event Loop & Microtasks',
    'Closures, Prototypes & Scope',
    'Async Await & Promises',
    'Modern ES6+ JavaScript',
  ],
  javascript: [
    'Namaste JavaScript Deep Dive',
    'Event Loop & Execution Context',
    'Closures & Higher Order Functions',
    'JavaScript Interview Questions',
  ],
  cpp: [
    'C++ Basics in One Shot',
    'C++ STL & Competitive Coding',
    'Pointers, References & Memory in C++',
    'Data Structures in C++',
  ],
  'c++': [
    'C++ Basics in One Shot',
    'C++ STL & Vectors',
    'Pointers & References in C++',
    'Data Structures in C++',
  ],
  system: [
    'System Design (HLD & LLD)',
    'Microservices & Message Queues',
    'Caching with Redis & CDNs',
    'Database Sharding & Replication',
  ],
  design: [
    'System Design (HLD & LLD)',
    'Low Level Design (LLD) Design Patterns',
    'Scalable Cloud Architecture',
  ],
  backend: [
    'Node.js & Express REST APIs',
    'PostgreSQL & Prisma ORM',
    'JWT Authentication & Security',
    'System Design & Microservices',
  ],
  node: [
    'Node.js & Express REST APIs',
    'Event-Driven Node.js Architecture',
    'JWT Authentication & Middlewares',
  ],
  sql: [
    'PostgreSQL Database & Prisma',
    'SQL Indexing & Joins Optimization',
    'Database Normalization & ACID',
  ],
  web: [
    'Full Stack Web Development',
    'React 19 & Next.js',
    'Namaste JavaScript',
    'HTML5, Tailwind CSS & UI Design',
  ],
  frontend: [
    'Namaste React & Redux',
    'Frontend Machine Coding Round',
    'Namaste JavaScript',
    'Web Performance & Optimization',
  ],
};

/**
 * Find YouTube-style related suggestions based on user query
 */
export function getSmartSearchSuggestions(
  rawQuery: string,
  courses: any[] = []
): SearchSuggestionResult {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return {
      keywordSuggestions: TRENDING_SEARCHES.slice(0, 6),
      matchedCourses: courses.slice(0, 3),
      relatedTags: ['DSA', 'React', 'JavaScript', 'System Design', 'Backend'],
    };
  }

  const suggestionsSet = new Set<string>();
  const relatedTagsSet = new Set<string>();

  // 1. Direct synonym / related topic mapping
  for (const [key, topics] of Object.entries(SYNONYM_TOPIC_MAP)) {
    if (query.includes(key) || key.includes(query)) {
      topics.forEach((t) => suggestionsSet.add(t));
      relatedTagsSet.add(key.toUpperCase());
    }
  }

  // 2. Match from live courses
  const matchedCourses: any[] = [];
  courses.forEach((c) => {
    const title = c.title || '';
    const category = c.category || '';
    const desc = c.description || '';

    const titleLower = title.toLowerCase();
    const catLower = category.toLowerCase();
    const descLower = desc.toLowerCase();

    if (
      titleLower.includes(query) ||
      catLower.includes(query) ||
      descLower.includes(query)
    ) {
      matchedCourses.push(c);
      suggestionsSet.add(title);
      if (category) {
        relatedTagsSet.add(category);
        suggestionsSet.add(`${category}: ${title}`);
      }
    }
  });

  // 3. Fallback matching against trending searches
  TRENDING_SEARCHES.forEach((item) => {
    if (item.toLowerCase().includes(query)) {
      suggestionsSet.add(item);
    }
  });

  // If few suggestions, add query prefix suggestions
  if (suggestionsSet.size < 4) {
    suggestionsSet.add(`${rawQuery} tutorial`);
    suggestionsSet.add(`${rawQuery} roadmap`);
    suggestionsSet.add(`${rawQuery} interview questions`);
    suggestionsSet.add(`best course for ${rawQuery}`);
  }

  return {
    keywordSuggestions: Array.from(suggestionsSet).slice(0, 6),
    matchedCourses: matchedCourses.slice(0, 3),
    relatedTags: Array.from(relatedTagsSet).slice(0, 4),
  };
}
