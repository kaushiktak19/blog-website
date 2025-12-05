import Head from "next/head";
import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Container from "../components/container";
import Layout from "../components/layout";
import {
  getAllCommunityPosts,
  getAllTechnologyPosts,
  getAllTags,
} from "../lib/api";
import Header from "../components/header";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import Testimonials from "../components/testimonials";
import TechnologyBackground from "../components/technology-background";
import LandingLatestCard from "../components/landing/landing-latest-card";
import LandingCollectionCard from "../components/landing/landing-collection-card";
import LandingTagsCard from "../components/landing/landing-tags-card";
import LandingWriterProgramCard from "../components/landing/writer-program-card";
import { Sparkles } from "lucide-react";
import { Post } from "../types/post";
import PostGrid from "../components/post-grid";
import PostCard from "../components/post-card";
import PostListRow from "../components/post-list-row";
import DateComponent from "../components/date";
import { getExcerpt } from "../utils/excerpt";
import { FaSearch, FaTimes } from "react-icons/fa";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import AuthorCard from "../components/AuthorCard";
import { authorData, getAuthorInfoByName } from "../lib/authorData";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

type PostEdge = {
  node: Post;
};

type TagNode = {
  name: string;
  slug?: string;
};

type IndexProps = {
  communityPosts: PostEdge[];
  technologyPosts: PostEdge[];
  tags: TagNode[];
  preview: boolean;
};

type ViewMode = "grid" | "list" | "featured" | "compact";
type CollectionFilter = "all" | "technology" | "community";
type CategorizedPost = Post & { __collection: "technology" | "community" };

const DATE_FILTERS = [
  { value: "all", label: "All dates" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "365", label: "Last year" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "Title A → Z" },
  { value: "za", label: "Title Z → A" },
];

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "grid", label: "Detailed view" },
  { value: "list", label: "List view" },
  { value: "featured", label: "Highlight view" },
  { value: "compact", label: "Compact view" },
];

const BLOG_COLLECTION_OPTIONS: { value: CollectionFilter; label: string }[] = [
  { value: "all", label: "All blogs" },
  { value: "technology", label: "Technology only" },
  { value: "community", label: "Community only" },
];

const LANDING_PAGE_SIZE = 18;

// Prioritized tags to show first in the tags card
const PRIORITIZED_TAGS = [
  "testing",
  "api",
  "devops",
  "kubernetes",
  "docker",
  "microservices",
  "automation",
  "ci/cd",
  "open source",
  "backend",
  "go",
  "python",
  "javascript",
  "typescript",
  "graphql",
  "rest",
  "observability",
  "monitoring",
  "performance",
  "security",
];

const dedupePosts = (posts: CategorizedPost[] = []) => {
  const seen = new Set<string>();
  return posts.filter((post) => {
    if (!post?.slug) return false;
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  });
};

const getCollectionFromPost = (post?: Post): "technology" | "community" => {
  const categories = post?.categories?.edges ?? [];
  const hasCommunity = categories.some(
    (edge) => edge?.node?.name?.toLowerCase() === "community"
  );
  return hasCommunity ? "community" : "technology";
};

const formatAuthorName = (name?: string) => {
  if (!name) return "Anonymous";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const resolveAuthorImage = (image?: string | null) => {
  if (!image || image === "imag1" || image === "image") {
    return "/blog/images/author.png";
  }
  return image;
};

type FeaturedAuthor = {
  name: string;
  avatarUrl?: string;
};
export default function Index({
  communityPosts,
  technologyPosts,
  preview,
  tags,
}: IndexProps) {
  const communityNodes = useMemo(
    () => communityPosts?.map(({ node }) => node) ?? [],
    [communityPosts]
  );
  const technologyNodes = useMemo(
    () => technologyPosts?.map(({ node }) => node) ?? [],
    [technologyPosts]
  );

  const combinedLatest = useMemo(() => {
    const merged = [...technologyNodes, ...communityNodes];
    return merged
      .filter((post) => Boolean(post?.slug))
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 6);
  }, [technologyNodes, communityNodes]);

  const curatedTags = useMemo(() => {
    const allTags = (tags || []).filter(
      (tag) => Boolean(tag?.name) && tag.name.trim().length > 0
    );
    
    // Normalize tag names for comparison (lowercase, trim)
    const normalizeTagName = (name: string) => name.toLowerCase().trim();
    
    // Separate prioritized and other tags
    const prioritized: TagNode[] = [];
    const others: TagNode[] = [];
    
    const prioritizedLower = PRIORITIZED_TAGS.map(normalizeTagName);
    const seen = new Set<string>();
    
    // First, collect prioritized tags
    for (const tag of allTags) {
      const normalized = normalizeTagName(tag.name);
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      
      if (prioritizedLower.includes(normalized)) {
        prioritized.push(tag);
      } else {
        others.push(tag);
      }
    }
    
    // Sort prioritized tags by their order in PRIORITIZED_TAGS
    prioritized.sort((a, b) => {
      const aIndex = prioritizedLower.indexOf(normalizeTagName(a.name));
      const bIndex = prioritizedLower.indexOf(normalizeTagName(b.name));
      return aIndex - bIndex;
    });
    
    // Combine: prioritized first, then others (up to 40 total)
    const combined = [...prioritized, ...others].slice(0, 40);
    
    return combined;
  }, [tags]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [combinedLatest.length]);

  useEffect(() => {
    if (combinedLatest.length <= 1) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % combinedLatest.length);
        setIsAnimating(false);
      }, 350);
    }, 4800);

    return () => clearInterval(interval);
  }, [combinedLatest.length]);

  const handleManualSelection = (index: number) => {
    if (index < 0 || index >= combinedLatest.length) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 250);
  };

  const technologyImageUrls = useMemo(
    () =>
      technologyNodes
        .map((post) => post.featuredImage?.node?.sourceUrl)
        .filter((url): url is string => Boolean(url))
        .slice(0, 10),
    [technologyNodes]
  );

  const communityImageUrls = useMemo(
    () =>
      communityNodes
        .map((post) => post.featuredImage?.node?.sourceUrl)
        .filter((url): url is string => Boolean(url))
        .slice(0, 10),
    [communityNodes]
  );

  const categorizedTechnologyPosts = useMemo<CategorizedPost[]>(
    () =>
      technologyNodes.map((post) => ({
        ...post,
        __collection: "technology" as const,
      })),
    [technologyNodes]
  );

  const categorizedCommunityPosts = useMemo<CategorizedPost[]>(
    () =>
      communityNodes.map((post) => ({
        ...post,
        __collection: "community" as const,
      })),
    [communityNodes]
  );

  const allCategorizedPosts = useMemo(
    () => dedupePosts([...categorizedTechnologyPosts, ...categorizedCommunityPosts]),
    [categorizedTechnologyPosts, categorizedCommunityPosts]
  );

  const featuredAuthors = useMemo<FeaturedAuthor[]>(() => {
    const seen = new Set<string>();
    const result: FeaturedAuthor[] = [];

    for (const post of allCategorizedPosts) {
      const rawName = post.ppmaAuthorName || "Anonymous";
      const name = formatAuthorName(rawName);
      if (seen.has(name)) continue;
      seen.add(name);

      const avatarUrl = resolveAuthorImage(post.ppmaAuthorImage);
      result.push({ name, avatarUrl });

      if (result.length >= 9) break;
    }

    // Enforce preferred display order if present
    const desiredOrder = ["neha", "shubham", "achananadi", "amaan", "charan", "gaurav"];
    const nameKey = (value: string) => value.toLowerCase().replace(/\s+/g, "");

    const lookup = new Map<string, FeaturedAuthor>();
    for (const author of result) {
      lookup.set(nameKey(author.name), author);
    }

    const ordered: FeaturedAuthor[] = [];
    for (const desired of desiredOrder) {
      const match = Array.from(lookup.entries()).find(([key]) => key.includes(desired));
      if (match && !ordered.some((a) => a.name === match[1].name)) {
        ordered.push(match[1]);
      }
    }

    // Append any remaining authors that were not in the preferred list
    for (const author of result) {
      if (!ordered.some((a) => a.name === author.name)) {
        ordered.push(author);
      }
    }

    // Limit to requested order length if provided, otherwise keep original cap
    const cap = desiredOrder.length > 0 ? desiredOrder.length : 9;
    return ordered.slice(0, cap);
  }, [allCategorizedPosts]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("featured");
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const authors = useMemo<string[]>(() => {
    const uniqueAuthors = new Set<string>(
      allCategorizedPosts.map((post) => post.ppmaAuthorName || "Anonymous")
    );
    return ["all", ...Array.from(uniqueAuthors)];
  }, [allCategorizedPosts]);

  const filtersActive = useMemo(
    () =>
      searchTerm.trim().length > 0 ||
      selectedAuthor !== "all" ||
      dateFilter !== "all" ||
      sortOption !== "newest" ||
      collectionFilter !== "all",
    [searchTerm, selectedAuthor, dateFilter, sortOption, collectionFilter]
  );

  const filteredPosts = useMemo(() => {
    const normalize = (value?: string) =>
      value?.replace(/<[^>]*>/g, "").toLowerCase() ?? "";

    const matchesDateFilter = (postDate: string) => {
      if (dateFilter === "all") return true;
      const days = Number(dateFilter);
      const now = new Date();
      const date = new Date(postDate);
      const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffInDays <= days;
    };

    const normalizedSearch = searchTerm.toLowerCase();

    const sorted = [...allCategorizedPosts]
      .filter((post) => {
        if (!normalizedSearch) return true;
        const titleMatch = normalize(post.title).includes(normalizedSearch);
        const excerptMatch = normalize(post.excerpt).includes(normalizedSearch);
        return titleMatch || excerptMatch;
      })
      .filter((post) =>
        selectedAuthor === "all"
          ? true
          : (post.ppmaAuthorName || "Anonymous") === selectedAuthor
      )
      .filter((post) => matchesDateFilter(post.date))
      .filter((post) =>
        collectionFilter === "all" ? true : post.__collection === collectionFilter
      );

    sorted.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOption === "az") {
        return a.title.localeCompare(b.title);
      }
      return b.title.localeCompare(a.title);
    });

    return sorted;
  }, [allCategorizedPosts, searchTerm, selectedAuthor, dateFilter, sortOption, collectionFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPosts.length / LANDING_PAGE_SIZE) || 1),
    [filteredPosts.length]
  );

  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * LANDING_PAGE_SIZE;
    return filteredPosts.slice(start, start + LANDING_PAGE_SIZE);
  }, [filteredPosts, currentPage]);

  const postsWithMeta = useMemo(
    () =>
      visiblePosts.map((post) => ({
        post,
        readingTime: post.content ? 5 + calculateReadingTime(post.content) : undefined,
      })),
    [visiblePosts]
  );

  const showEmptyState = visiblePosts.length === 0;

  const browseHeading = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    const filterParts: string[] = [];

    if (selectedAuthor !== "all") {
      filterParts.push(`author: ${selectedAuthor}`);
    }

    if (collectionFilter !== "all") {
      filterParts.push(
        `collection: ${collectionFilter === "technology" ? "technology" : "community"}`
      );
    }

    if (dateFilter !== "all") {
      const dateLabel = DATE_FILTERS.find((filter) => filter.value === dateFilter)?.label;
      if (dateLabel) {
        filterParts.push(`date: ${dateLabel.toLowerCase()}`);
      }
    }

    if (sortOption !== "newest") {
      const sortLabel = SORT_OPTIONS.find((sort) => sort.value === sortOption)?.label;
      if (sortLabel) {
        filterParts.push(`sorted ${sortLabel.toLowerCase()}`);
      }
    }

    if (trimmedSearch.length > 0) {
      return filterParts.length
        ? `Search results for “${trimmedSearch}” (${filterParts.join(", ")})`
        : `Search results for “${trimmedSearch}”`;
    }

    if (filterParts.length > 0) {
      return `Filtered blogs (${filterParts.join(", ")})`;
    }

    return "All technology & community blogs";
  }, [searchTerm, selectedAuthor, dateFilter, sortOption, collectionFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAuthor("all");
    setDateFilter("all");
    setSortOption("newest");
    setViewMode("grid");
    setCollectionFilter("all");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAuthor, dateFilter, sortOption, collectionFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const activePost = combinedLatest[activeIndex] || combinedLatest[0];
  const activeCollection = getCollectionFromPost(activePost);
  const activeBasePath = activeCollection === "community" ? "/community" : "/technology";

  const heroSubheading =
    "Stories from the Keploy engineering team, community builders, and open-source contributors.";

  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Blog - Keploy`}
      Description={
        "The Keploy Blog offers in-depth articles and expert insights on software testing, automation, and quality assurance, empowering developers to enhance their testing strategies and deliver robust applications."
      }
    >
      <Head>
        <title>{`Keploy Blog | Technology & Community`}</title>
      </Head>
      <TechnologyBackground />
      <Header />

      <section className="relative z-10 px-4 sm:px-6 pt-10 pb-10 md:pt-14 md:pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 md:mb-12">
            <h1 className="type-hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.75rem] 2xl:text-[6.1rem] p-3 leading-tight tracking-wider bg-[linear-gradient(120deg,_#fdba74_0,_#fb923c_28%,_#f97316_55%,_#ea580c_80%,_#7c2d12_100%)] bg-clip-text text-transparent">
              The Keploy Blog
            </h1>
            <p className="type-hero-body mx-auto mt-4 mb-4 max-w-xl text-base sm:text-xl text-slate-600 leading-relaxed px-4">
              {heroSubheading}
            </p>
          </div>

          <div className="p-2 sm:p-4 md:p-5">
            <div className="grid gap-5 lg:gap-8 lg:grid-cols-2 items-stretch">
              <div className="flex h-full flex-col">
                <div className="flex-1 flex flex-col">
                  {activePost ? (
                    <LandingLatestCard
                      post={activePost}
                      heading="Latest blogs"
                      headingIcon={<Sparkles className="h-5 w-5 text-white" />}
                      className={`transition-all duration-500 ${
                        isAnimating ? "opacity-80 scale-[0.98]" : "opacity-100 scale-100"
                      }`}
                      basePath={activeBasePath}
                      dotsCount={combinedLatest.length}
                      activeIndex={activeIndex}
                      onDotClick={handleManualSelection}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-500">
                      No blogs available yet. Check back soon!
                    </div>
                  )}
                </div>
              </div>

              <div className="grid h-full gap-5 lg:grid-rows-[auto_1fr_0.72fr] overflow-visible">
                <LandingTagsCard tags={curatedTags} className="text-[13px] sm:text-sm" />
                <div className="grid h-full gap-5 sm:grid-cols-2">
                  <LandingCollectionCard
                    title="Tech deep dives, architecture notes, and product changelogs."
                    description="Follow every release, understand the architecture trade-offs, and see how engineers operationalize each change across production."
                    href="/technology"
                    accent="technology"
                    className="h-full text-sm sm:text-[0.95rem]"
                    imageUrls={technologyImageUrls}
                  />
                  <LandingCollectionCard
                    title="Community stories, meetups, and open-source journeys."
                    description="Discover how builders run meetups, mentor peers, document takeaways, and grow the Keploy ecosystem across global chapters."
                    href="/community"
                    accent="community"
                    className="h-full text-sm sm:text-[0.95rem]"
                    imageUrls={communityImageUrls}
                  />
                </div>
                <LandingWriterProgramCard className="h-full text-[13px] sm:text-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Container>
        <section className="mt-10 mb-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
            <div className="flex-[1] min-w-[260px] lg:pr-6">
              <h2 className="type-section-title relative inline-block whitespace-nowrap text-3xl md:text-4xl lg:text-[2.25rem] tracking-[-0.01em] leading-snug text-gray-700 text-left">
                <span className="relative z-10">All blogs</span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-orange-200/80 to-orange-100/80 -z-0" />
              </h2>
              <span className="sr-only" aria-live="polite">
                {`${browseHeading}. ${filteredPosts.length} results match the current filters`}
              </span>
            </div>

            <div className="w-full lg:flex-[1] mt-2 lg:mt-0">
              <div className="rounded-2xl border border-slate-200/70 bg-white px-3 py-4 sm:px-3.5 shadow-[0_14px_45px_rgba(15,23,42,0.08)] lg:relative lg:z-20 lg:-translate-x-6">
                <div className="flex flex-wrap gap-2.5 lg:gap-3 items-stretch lg:items-center lg:flex-nowrap lg:justify-end">
                  <div className="relative flex-1 min-w-[200px] lg:max-w-[240px]">
                    <div className="relative h-11 rounded-2xl border border-slate-200 bg-white transition-all focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                      <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-full pl-9 pr-8 rounded-2xl bg-transparent text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
                      />
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400/80 pointer-events-none w-[16px] h-[16px]" />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                          aria-label="Clear search"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 w-full lg:w-auto lg:flex-nowrap">
                    <div className="flex-[0.9] min-w-[110px]">
                      <LandingFilterSelect
                        label="Author"
                        value={selectedAuthor}
                        onChange={setSelectedAuthor}
                        options={authors.map((author) => ({
                          value: author,
                          label: author === "all" ? "All authors" : author,
                        }))}
                      />
                    </div>

                    <div className="flex-[0.9] min-w-[110px]">
                      <LandingFilterSelect
                        label="Blogs"
                        value={collectionFilter}
                        onChange={(value) => setCollectionFilter(value as CollectionFilter)}
                        options={BLOG_COLLECTION_OPTIONS}
                      />
                    </div>

                    <div className="flex-[0.9] min-w-[110px]">
                      <LandingFilterSelect
                        label="Published"
                        value={dateFilter}
                        onChange={setDateFilter}
                        options={DATE_FILTERS}
                      />
                    </div>

                    <div className="flex-[0.9] min-w-[110px]">
                      <LandingFilterSelect
                        label="Sort"
                        value={sortOption}
                        onChange={setSortOption}
                        options={SORT_OPTIONS}
                      />
                    </div>

                    <div className="flex-[0.9] min-w-[110px]">
                      <LandingFilterSelect
                        label="View mode"
                        value={viewMode}
                        onChange={(value) => setViewMode(value as ViewMode)}
                        options={VIEW_OPTIONS}
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-auto lg:ml-2">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="w-full lg:w-auto h-11 px-5 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-200 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showEmptyState ? (
            <div className="text-center bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-gray-500">
              No posts match your filters. Try adjusting the search or filters above.
            </div>
          ) : viewMode === "grid" ? (
            <PostGrid>
              {postsWithMeta.map(({ post, readingTime }) => (
                <PostCard
                  key={post.slug}
                  title={post.title}
                  coverImage={post.featuredImage}
                  date={post.date}
                  author={post.ppmaAuthorName}
                  slug={post.slug}
                  excerpt={getExcerpt(post.excerpt, 36)}
                  isCommunity={post.__collection === "community"}
                  authorImage={post.ppmaAuthorImage}
                  readingTime={readingTime}
                  variant="subtle"
                />
              ))}
            </PostGrid>
          ) : viewMode === "list" ? (
            <div className="space-y-6">
              {postsWithMeta.map(({ post, readingTime }) => (
                <PostListRow
                  key={post.slug}
                  post={post}
                  isCommunity={post.__collection === "community"}
                  excerptOverride={getExcerpt(post.excerpt, 110)}
                  readingTime={readingTime}
                />
              ))}
            </div>
          ) : viewMode === "featured" ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {postsWithMeta.map(({ post, readingTime }) => (
                <LandingFeaturedBlogCard key={post.slug} post={post} readingTime={readingTime} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {postsWithMeta.map(({ post, readingTime }) => (
                <LandingCompactBlogCard key={post.slug} post={post} readingTime={readingTime} />
              ))}
            </div>
          )}
        </section>

        <LandingPaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Container>

      <Container>
        <section className="mt-10 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex-[1] min-w-[260px] lg:pr-6">
              <h2 className="type-section-title relative inline-block whitespace-nowrap text-3xl md:text-4xl lg:text-[2.25rem] tracking-[-0.01em] leading-snug text-gray-700 text-left">
                <span className="relative z-10">Meet our authors</span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-orange-200/80 to-orange-100/80 -z-0" />
              </h2>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAuthors.map((author) => {
              const info = getAuthorInfoByName(author.name);
              return (
                <Link
                  key={author.name}
                  href={`/authors/${sanitizeAuthorSlug(author.name)}`}
                  className="group block h-full"
                >
                  <AuthorCard
                    name={author.name}
                    avatarUrl={author.avatarUrl}
                    bio={info?.description}
                    linkedin={info?.linkedin}
                  />
                </Link>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/authors"
              className="inline-flex items-center text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
            >
              View all authors
              <span className="ml-1.5 text-base">→</span>
            </Link>
          </div>
        </section>
      </Container>

      <Container>
        <Testimonials />
      </Container>
    </Layout>
  );
}

function LandingFeaturedBlogCard({
  post,
  readingTime,
}: {
  post: CategorizedPost;
  readingTime?: number;
}) {
  const authorName = formatAuthorName(post.ppmaAuthorName);
  const authorImage = resolveAuthorImage(post.ppmaAuthorImage);
  const coverSrc = post.featuredImage?.node?.sourceUrl;
  const readingLabel =
    typeof readingTime === "number" && readingTime > 0 ? `${readingTime} min read` : null;
  const href = `/${post.__collection}/${post.slug}`;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  return (
    <Link href={href} className="group block h-full">
      <article className="h-full rounded-2xl bg-white/95 border border-orange-100 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 overflow-hidden hover:border-orange-300 hover:-translate-y-1.5 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)] flex flex-col">
        <div className="relative w-full aspect-video overflow-hidden">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={post.title?.replace(/<[^>]*>/g, "") ?? "Blog cover"}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100" />
          )}
        </div>
        <div className="px-6 pt-5 pb-6 flex flex-col flex-1 gap-3.5">
          <h3 className="type-card-title text-xl md:text-2xl text-gray-700">
            <span
              className="line-clamp-2 group-hover:text-orange-600 transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />
          </h3>
          <div className="mt-auto flex items-center gap-2 text-[0.7rem] md:text-[0.75rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden">
            <Image
              src={authorImage}
              alt={`${authorName} avatar`}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <span className="font-heading font-medium text-gray-800 tracking-tight max-w-[170px] md:max-w-none truncate text-[0.95rem] md:text-[1.02rem]">
              {authorName}
            </span>
            <span className="text-slate-300 flex-shrink-0 -mx-0.5">•</span>
            <span className="whitespace-nowrap flex-shrink-0 text-[0.68rem] md:text-[0.72rem] tracking-tight">
              <DateComponent dateString={post.date} />
            </span>
            {readingLabel && (
              <>
                <span className="text-slate-300 flex-shrink-0 -mx-0.5">•</span>
                <span className="whitespace-nowrap flex-shrink-0 type-meta text-slate-500 text-[0.68rem] md:text-[0.72rem] tracking-tight">
                  {readingLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function LandingCompactBlogCard({
  post,
  readingTime,
}: {
  post: CategorizedPost;
  readingTime?: number;
}) {
  const authorName = formatAuthorName(post.ppmaAuthorName);
  const authorImage = resolveAuthorImage(post.ppmaAuthorImage);
  const readingLabel =
    typeof readingTime === "number" && readingTime > 0 ? `${readingTime} min read` : null;
  const href = `/${post.__collection}/${post.slug}`;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  return (
    <Link href={href} className="group block h-full">
      <article className="h-full rounded-2xl bg-white/95 border border-orange-100 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 overflow-hidden hover:border-orange-300 hover:-translate-y-1.5 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)] flex flex-col">
        <div className="px-6 pt-5 pb-6 flex flex-col flex-1 gap-3.5">
          <h3 className="type-card-title text-xl md:text-2xl text-gray-700 leading-snug">
            <span
              className="line-clamp-2 group-hover:text-orange-600 transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />
          </h3>
          <div
            className="type-card-excerpt text-[0.88rem] md:text-[0.95rem] text-slate-600 leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 34) }}
          />
          <div className="mt-auto flex items-center gap-2 text-[0.7rem] md:text-[0.75rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden">
            <Image
              src={authorImage}
              alt={`${authorName} avatar`}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <span className="font-heading font-medium text-gray-800 tracking-tight max-w-[170px] md:max-w-none truncate text-[0.95rem] md:text-[1.02rem]">
              {authorName}
            </span>
            <span className="text-slate-300 flex-shrink-0 -mx-0.5">•</span>
            <span className="whitespace-nowrap flex-shrink-0 text-[0.68rem] md:text-[0.72rem] tracking-tight">
              <DateComponent dateString={post.date} />
            </span>
            {readingLabel && (
              <>
                <span className="text-slate-300 flex-shrink-0 -mx-0.5">•</span>
                <span className="whitespace-nowrap flex-shrink-0 type-meta text-slate-500 text-[0.68rem] md:text-[0.72rem] tracking-tight">{readingLabel}</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function LandingFilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={containerRef}>
      <button
        type="button"
        className={`relative w-full h-11 rounded-xl border text-left px-3.5 pr-9 text-sm font-medium flex items-center min-w-0 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-200 transition-colors ${
          isOpen ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate flex-1 min-w-0">{activeOption?.label ?? label}</span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-sm z-20 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium tracking-tight transition-colors truncate ${
                    isActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  title={option.label}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LandingPaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const MAX_VISIBLE = 6;
  const [windowStart, setWindowStart] = useState(1);
  const maxWindowStart = Math.max(1, totalPages - MAX_VISIBLE + 1);

  useEffect(() => {
    const halfWindow = Math.floor(MAX_VISIBLE / 2);
    let nextStart = Math.max(1, currentPage - halfWindow);
    let nextEnd = Math.min(totalPages, nextStart + MAX_VISIBLE - 1);
    nextStart = Math.max(1, nextEnd - MAX_VISIBLE + 1);
    setWindowStart((prev) => (prev === nextStart ? prev : nextStart));
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  const windowEnd = Math.min(totalPages, windowStart + MAX_VISIBLE - 1);
  const pageRange = Array.from({ length: windowEnd - windowStart + 1 }, (_, idx) => windowStart + idx);
  const showLeadingFirst = windowStart > 1;
  const showTrailingLast = windowEnd < totalPages;
  const showLeftEllipsis = windowStart > 2;
  const showRightEllipsis = windowEnd < totalPages - 1;

  const shiftWindow = (direction: "prev" | "next") => {
    setWindowStart((prev) => {
      if (direction === "prev") {
        return Math.max(1, prev - MAX_VISIBLE);
      }
      return Math.min(maxWindowStart, prev + MAX_VISIBLE);
    });
  };

  const baseButtonStyles =
    "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-xs font-semibold transition-colors";

  const pageButtonClasses = (isActive: boolean) =>
    `${baseButtonStyles} ${
      isActive
        ? "bg-orange-500 text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
    }`;

  const renderPageNode = (page: number) => {
    const isActive = page === currentPage;
    return (
      <button
        type="button"
        key={`page-${page}`}
        className={pageButtonClasses(isActive)}
        onClick={() => onPageChange(page)}
        disabled={isActive}
        aria-current={isActive ? "page" : undefined}
      >
        {page}
      </button>
    );
  };

  const arrowClasses = (disabled: boolean) =>
    `${baseButtonStyles} ${
      disabled
        ? "border border-slate-100 text-slate-300 cursor-not-allowed bg-white"
        : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
    }`;

  const renderArrow = (direction: "prev" | "next") => {
    const isPrev = direction === "prev";
    const targetPage = isPrev ? currentPage - 1 : currentPage + 1;
    const isDisabled = isPrev ? currentPage <= 1 : currentPage >= totalPages;
    const label = isPrev ? "Previous page" : "Next page";
    const symbol = isPrev ? "←" : "→";

    return (
      <button
        type="button"
        key={direction}
        className={arrowClasses(isDisabled)}
        disabled={isDisabled}
        onClick={() => onPageChange(Math.min(totalPages, Math.max(1, targetPage)))}
        aria-label={label}
      >
        {symbol}
      </button>
    );
  };

  const EllipsisButton = ({ direction }: { direction: "prev" | "next" }) => (
    <button
      type="button"
      className={`${baseButtonStyles} border border-transparent px-1 text-base text-slate-400 hover:text-orange-600`}
      onClick={() => shiftWindow(direction)}
      aria-label={direction === "prev" ? "Show previous pages" : "Show next pages"}
    >
      …
    </button>
  );

  return (
    <nav className="mt-12 mb-16 flex justify-center" aria-label="Pagination">
      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
        {renderArrow("prev")}
        {showLeadingFirst && renderPageNode(1)}
        {showLeftEllipsis && <EllipsisButton direction="prev" />}
        {pageRange.map(renderPageNode)}
        {showRightEllipsis && <EllipsisButton direction="next" />}
        {showTrailingLast && renderPageNode(totalPages)}
        {renderArrow("next")}
      </div>
    </nav>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const [communityNodes, technologyNodes, allTags] = await Promise.all([
    getAllCommunityPosts(preview),
    getAllTechnologyPosts(preview),
    getAllTags(),
  ]);

  const communityEdges = Array.isArray(communityNodes)
    ? communityNodes.map((node) => ({ node }))
    : [];
  const technologyEdges = Array.isArray(technologyNodes)
    ? technologyNodes.map((node) => ({ node }))
    : [];

  return {
    props: {
      communityPosts: communityEdges,
      technologyPosts: technologyEdges,
      tags: Array.isArray(allTags) ? allTags : [],
      preview,
    },
    revalidate: 30,
  };
};