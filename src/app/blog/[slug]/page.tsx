import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, formatDate } from "@/lib/blog-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Статья не найдена",
    };
  }

  return {
    title: `${post.title} | Блог Resumio`,
    description: post.metaDescription || post.excerpt || post.title,
    keywords: post.metaKeywords || [],
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt || post.title,
      type: "article",
      publishedTime: post.date,
      siteName: "Resumio",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

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

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        {/* Back Button */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] hover:text-[#218dd0] transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.5 7L9.5 12L14.5 17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Назад к блогу
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block rounded-lg bg-[#218dd0] px-3 py-1 text-sm font-semibold text-white">
              {post.category}
            </span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-[#1f2937] sm:text-4xl">{post.title}</h1>
          <p className="text-sm text-[#6b7280]">{formatDate(post.date)}</p>
        </header>

        {/* Article Image */}
        {post.image && (
          <div className="mb-8 h-64 w-full overflow-hidden rounded-2xl bg-[#e5e7eb] sm:h-96">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={600}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="rounded-2xl bg-white p-8 border border-[#dfe7f4]">
          {post.content ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-[#1f2937] prose-p:text-[#4b5563] prose-a:text-[#218dd0] prose-strong:text-[#1f2937]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="space-y-4 text-[#4b5563]">
              <p className="text-lg">{post.excerpt || "Содержание статьи будет добавлено позже."}</p>
              <p className="text-sm text-[#6b7280] italic">
                Эта статья находится в разработке. Полный текст будет добавлен в ближайшее время.
              </p>
            </div>
          )}
        </div>

        {/* Navigation to other posts */}
        <div className="mt-8 flex justify-between gap-4">
          <Link
            href="/blog"
            className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#1f2937] hover:bg-[#f9fafb] transition"
          >
            Все статьи
          </Link>
        </div>
      </article>
    </main>
  );
}

