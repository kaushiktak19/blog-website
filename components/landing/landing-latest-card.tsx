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
    <div className={`rounded-md border border-black/90 bg-white shadow-md shadow-neutral-900 overflow-hidden flex flex-col ${className}`}>
      {heading && (
        <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
          {headingIcon}
          <span className="text-white font-semibold tracking-wide uppercase text-sm">{heading}</span>
        </div>
      )}
      <Link
        href={`${basePath}/${post.slug}`}
        className="group flex flex-col gap-4 px-4 pb-4 pt-4 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label={`Read ${post.title}`}
      >
        {post.featuredImage && (
          <div className="overflow-hidden rounded-sm w-full">
            <CoverImage
              title={post.title}
              coverImage={post.featuredImage}
              slug={undefined}
              isCommunity={isCommunity}
              imgClassName="w-full h-[320px] sm:h-[360px] object-cover object-center rounded-none transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          {post.ppmaAuthorImage && post.ppmaAuthorImage !== "imag1" && post.ppmaAuthorImage !== "image" ? (
            <Image
              src={post.ppmaAuthorImage}
              alt={`${post.ppmaAuthorName || "Author"}'s avatar`}
              className="w-7 h-7 rounded-full flex-shrink-0"
              height={28}
              width={28}
            />
          ) : (
            <Image
              src="/blog/images/author.png"
              alt="Author avatar"
              className="w-7 h-7 rounded-full flex-shrink-0"
              height={28}
              width={28}
            />
          )}
          <span className="font-semibold text-gray-900 truncate">{post.ppmaAuthorName || "Anonymous"}</span>
          <span className="text-gray-300 flex-shrink-0">•</span>
          <span className="whitespace-nowrap flex-shrink-0">
            <DateComponent dateString={post.date} />
          </span>
          {readingTime && readingTime > 0 && (
            <>
              <span className="text-gray-300 flex-shrink-0">•</span>
              <span className="whitespace-nowrap flex-shrink-0">{readingTime} min read</span>
            </>
          )}
        </div>
        <h3
          className="text-xl font-semibold text-card-foreground leading-snug transition-colors group-hover:text-orange-600"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
        <div
          className="text-sm text-gray-600 leading-relaxed line-clamp-3"
          dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 36) }}
        />
      </Link>
    </div>
  );
}

