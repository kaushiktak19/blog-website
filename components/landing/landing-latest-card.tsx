import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import CoverImage from "../cover-image";
import DateComponent from "../date";
import { Post } from "../../types/post";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import { getExcerpt } from "../../utils/excerpt";

type LandingHeroVariant = "visual" | "details";

type LandingLatestCardProps = {
  post: Post;
  variant?: LandingHeroVariant;
  heading?: string;
  headingIcon?: ReactNode;
  className?: string;
  basePath: "/technology" | "/community";
};

export default function LandingLatestCard({
  post,
  heading,
  headingIcon,
  className = "",
  basePath,
}: LandingLatestCardProps) {
  const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");
  const isCommunity = basePath === "/community";

  return (
    <div
      className={`rounded-2xl bg-white/95 border border-orange-100 shadow-[0_18px_55px_rgba(15,23,42,0.08)] hover:border-orange-300 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)] overflow-hidden flex flex-col transition-all duration-300 ${className}`}
    >
      {heading && (
        <div className="bg-orange-500 px-5 py-3 flex items-center gap-2.5">
          {headingIcon && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              {headingIcon}
            </span>
          )}
          <span className="font-heading text-white font-semibold uppercase tracking-[0.3em] text-xs">
            {heading}
          </span>
        </div>
      )}
      <Link
        href={`${basePath}/${post.slug}`}
        className="group flex flex-col gap-4 px-5 py-5 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
        aria-label={`Read ${post.title}`}
      >
        {post.featuredImage && (
          <div className="w-full overflow-hidden rounded-md bg-slate-100/60">
            <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px]">
              <CoverImage
                title={post.title}
                coverImage={post.featuredImage}
                slug={undefined}
                isCommunity={isCommunity}
                containerClassName="w-full h-full"
                imgClassName="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center gap-3 text-[0.75rem] md:text-[0.8rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden">
          {post.ppmaAuthorImage && post.ppmaAuthorImage !== "imag1" && post.ppmaAuthorImage !== "image" ? (
            <Image
              src={post.ppmaAuthorImage}
              alt={`${post.ppmaAuthorName || "Author"}'s avatar`}
              className="w-9 h-9 rounded-full flex-shrink-0"
              height={36}
              width={36}
            />
          ) : (
            <Image
              src="/blog/images/author.png"
              alt="Author avatar"
              className="w-9 h-9 rounded-full flex-shrink-0"
              height={36}
              width={36}
            />
          )}
          <span className="font-heading font-medium text-gray-800 tracking-tight truncate max-w-[210px] md:max-w-[240px] text-[0.95rem] md:text-[1.02rem]">
            {post.ppmaAuthorName || "Anonymous"}
          </span>
          <span className="text-slate-300 flex-shrink-0 -mx-0.5">•</span>
          <span className="whitespace-nowrap flex-shrink-0 text-[0.6rem] md:text-[0.65rem] tracking-tight">
            <DateComponent dateString={post.date} />
          </span>
          {readingTime !== undefined && readingTime > 0 && (
            <>
              <span className="text-slate-300 flex-shrink-0 -mx-0.5">•</span>
              <span className="whitespace-nowrap flex-shrink-0 type-meta text-slate-500 text-[0.68rem] md:text-[0.72rem] tracking-tight">
                {readingTime} min read
              </span>
            </>
          )}
        </div>
        <h3
          className="type-card-title text-xl md:text-2xl text-gray-700 leading-snug transition-colors group-hover:text-orange-600 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
        <div
          className="type-card-excerpt text-[0.88rem] md:text-[0.95rem] leading-relaxed line-clamp-3 text-slate-600"
          dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 36) }}
        />
      </Link>
    </div>
  );
}

