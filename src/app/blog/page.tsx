"use client";

import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { blogPosts, categories, getPostsByCategory, formatDate, type BlogCategory } from "@/lib/blog-data";

function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = (searchParams.get("category") as BlogCategory) || "Все";
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>(initialCategory);

  const filteredPosts = useMemo(() => getPostsByCategory(selectedCategory), [selectedCategory]);

  const handleCategoryChange = (category: BlogCategory) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "Все") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/blog?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Logo and Navigation */}
      <header className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/">
                <Image src="/resumio-logo.svg" alt="Resumio" width={143} height={40} priority />
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-[#218dd0] transition hover:text-[#218dd0] sm:text-base"
              >
                Блог
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e3e2e7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:border-[#218dd0] sm:h-11 sm:w-11"
              aria-label="Профиль"
            >
              <Image src="/user.svg" alt="Профиль" width={24} height={24} loading="lazy" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <h1 className="mb-8 text-4xl font-bold text-[#1f2937] sm:text-5xl">блог</h1>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-[#218dd0] text-white shadow-sm"
                  : "bg-[#f4f7fb] text-[#1f2937] hover:bg-[#eef2f7] border border-[#dfe7f4]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl bg-white p-6 border border-[#dfe7f4] transition hover:shadow-md hover:border-[#218dd0]"
            >
              {/* Placeholder for illustration */}
              <div className="mb-4 h-48 w-full rounded-xl bg-[#e5e7eb] flex items-center justify-center">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={200}
                    loading="lazy"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="text-[#9ca3af] text-sm">Иллюстрация</div>
                )}
              </div>

              {/* Post Title */}
              <h2 className="mb-3 text-lg font-semibold text-[#1f2937] line-clamp-2 group-hover:text-[#218dd0] transition">
                {post.title}
              </h2>

              {/* Post Date */}
              <p className="text-sm text-[#6b7280]">{formatDate(post.date)}</p>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="rounded-2xl bg-[#f4f7fb] p-12 text-center border border-[#dfe7f4]">
            <p className="text-lg text-[#6b7280]">Статей в этой категории пока нет</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-8 h-12 w-32 animate-pulse rounded bg-[#e5e7eb]"></div>
          <div className="mb-8 flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-[#e5e7eb]"></div>
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#f4f7fb]"></div>
            ))}
          </div>
        </div>
      </main>
    }>
      <BlogContent />
    </Suspense>
  );
}

