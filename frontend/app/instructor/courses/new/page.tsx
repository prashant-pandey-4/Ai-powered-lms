'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { ArrowLeft, Plus } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function NewCoursePage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: '0',
    level: 'beginner',
    thumbnail: '',
    language: 'English',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
      };

      const res = await fetchApi<any>('/courses', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        router.push(`/instructor/courses/${res.data.id}/edit`);
      } else {
        setErrorMessage(res.message || 'Failed to create course. Please verify fields.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Create New Course" />

      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <Link
          href="/instructor"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Instructor Studio
        </Link>

        <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Course Overview & Metadata</h2>
            <p className="mt-1 text-xs text-[#8e8e9c]">
              Provide the foundational details for your course before adding sequential video lectures and resource attachments.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8e8e9c]">
                Course Title <span className="text-[#d4f76d]">*</span>
              </label>
              <input
                required
                placeholder="e.g. Master Modern Distributed Systems with Go"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8e8e9c]">
                Description <span className="text-[#d4f76d]">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Provide a comprehensive summary of the practical skills students will master in this curriculum..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-[#23232a] bg-[#0d0d10] p-3 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8e8e9c]">Category</label>
                <input
                  placeholder="e.g. Web Development, System Design"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8e8e9c]">Difficulty Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3 text-xs text-white focus:border-[#d4f76d] focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Price & Thumbnail */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8e8e9c]">
                  Price (INR) <span className="text-[#6c6c7a] font-normal">(0 = Free)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8e8e9c]">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#23232a]">
              <Link href="/instructor">
                <button
                  type="button"
                  className="rounded-full border border-[#23232a] bg-[#1c1c22] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#23232a] transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {submitting ? 'Creating Course...' : 'Continue to Add Lectures'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
