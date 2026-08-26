'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { Search, BookOpen, Star, Users, ArrowRight, Heart, Play } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'UX/UI', 'Development', 'Design', 'Backend', 'System Design'];

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      const res = await fetchApi<any[]>('/courses');
      if (res.success && res.data && res.data.length > 0) {
        setCourses(res.data);
      } else {
        setCourses([
          {
            id: 'course-1',
            title: 'Start in Web Design',
            description: 'Typography and layout rules for responsive web applications.',
            thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
            category: 'UX/UI',
            level: 'Basic',
            price: 25,
            rating: 4.9,
            studentsCount: 1435,
            instructor: { name: 'Esther Howard', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
          },
          {
            id: 'course-2',
            title: 'Learn Development & grow',
            description: 'Master full stack engineering with Next.js, Node.js and TypeScript.',
            thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
            category: 'Development',
            level: 'Basic',
            price: 25,
            rating: 4.9,
            studentsCount: 1435,
            instructor: { name: 'Esther Howard', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
          },
          {
            id: 'course-3',
            title: 'Logo & Branding Masterclass',
            description: 'Create memorable visual identities, logo marks, and style systems.',
            thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
            category: 'Design',
            level: 'Basic',
            price: 25,
            rating: 4.9,
            studentsCount: 1435,
            instructor: { name: 'Esther Howard', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
          },
        ]);
      }
      setLoading(false);
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || (c.category && c.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Library" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Category Pills & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#d4f76d] text-black shadow-sm'
                    : 'bg-[#16161a] text-[#8e8e9c] border border-[#23232a] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8e9c]" />
            <input
              type="text"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-full border border-[#23232a] bg-[#16161a] pl-10 pr-4 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
            />
          </div>
        </div>

        {/* Grid of Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl bg-[#23232a]" />
                <Skeleton className="h-5 w-3/4 bg-[#23232a]" />
                <Skeleton className="h-4 w-full bg-[#23232a]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course: any) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-[#34343d]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80'}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4f76d] text-black shadow-md">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                  </div>
                  <button className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs">
                    <Heart className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col pt-3">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#d4f76d] line-clamp-1 transition-colors">
                    {course.title}
                  </h4>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="rounded-full bg-[#23232a] px-3 py-1 text-[10px] font-bold text-[#d4f76d]">
                      {course.level || 'Basic'}
                    </span>
                    <div className="flex items-center gap-2.5 text-[11px] text-[#8e8e9c]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="h-3 w-3" />
                        {course.studentsCount || 1435}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#d4f76d]">
                        <Star className="h-3 w-3 fill-current" />
                        {course.rating || 4.9}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8e8e9c]">
                    <img
                      src={course.instructor?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                      alt="Instructor"
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    <span className="font-medium text-white truncate">
                      {course.instructor?.name || 'Esther Howard'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#23232a] pt-2.5">
                    <span className="text-sm font-extrabold text-white">
                      {typeof course.price === 'number' && course.price === 0 ? 'Free' : `$${course.price || 25}`}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#8e8e9c] group-hover:text-[#d4f76d] transition-colors">
                      View Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
