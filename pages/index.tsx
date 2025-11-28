import Head from "next/head";
import { GetStaticProps } from "next";
import { useEffect, useMemo, useState } from "react";
import Container from "../components/container";
import Layout from "../components/layout";
import {
  getAllPostsForCommunity,
  getAllPostsForTechnology,
  getAllTags,
} from "../lib/api";
import Header from "../components/header";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import TopBlogs from "../components/topBlogs";
import Testimonials from "../components/testimonials";
import TechnologyBackground from "../components/technology-background";
import LandingLatestCard from "../components/landing/landing-latest-card";
import LandingCollectionCard from "../components/landing/landing-collection-card";
import LandingTagsCard from "../components/landing/landing-tags-card";
import LandingWriterProgramCard from "../components/landing/writer-program-card";
import { Sparkles } from "lucide-react";
import { Post } from "../types/post";

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

const getCollectionFromPost = (post?: Post): "technology" | "community" => {
  const categories = post?.categories?.edges ?? [];
  const hasCommunity = categories.some(
    (edge) => edge?.node?.name?.toLowerCase() === "community"
  );
  return hasCommunity ? "community" : "technology";
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
    return (tags || []).filter((tag) => Boolean(tag?.name)).slice(0, 15);
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

      <section className="relative z-10 px-4 sm:px-6 md:px-8 pt-10 pb-6 md:pt-14 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
              Keploy Blog
            </h1>
            <p className="mt-4 mb-6 text-3xl sm:text-4xl font-semibold leading-snug bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Engineering insights. Community voices. Real-world playbooks.
            </p>
            <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-600 leading-relaxed px-4">
              {heroSubheading}
            </p>
          </div>

          <div className="rounded-md border border-black/90 bg-white/95 p-5 sm:p-6 shadow-md shadow-neutral-900/40 backdrop-blur">
            <div className="grid gap-5 lg:gap-8 lg:grid-cols-2 items-stretch">
              <div className="flex h-full flex-col">
                <div className="flex-1 flex flex-col">
                  {activePost ? (
                    <>
                      <LandingLatestCard
                        variant="visual"
                        post={activePost}
                        heading="Latest blogs"
                        headingIcon={<Sparkles className="h-5 w-5 text-white" />}
                        className={`transition-all duration-500 ${
                          isAnimating ? "opacity-80 scale-[0.98]" : "opacity-100 scale-100"
                        }`}
                        basePath={activeBasePath}
                      />
                      <LandingLatestCard
                        variant="details"
                        post={activePost}
                        className={`mt-4 transition-all duration-500 ${
                          isAnimating ? "opacity-80 translate-y-1" : "opacity-100 translate-y-0"
                        }`}
                        basePath={activeBasePath}
                      />
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-500">
                      No blogs available yet. Check back soon!
                    </div>
                  )}
                </div>

                {combinedLatest.length > 1 && (
                  <div className="-mt-3 flex flex-wrap items-center justify-center gap-2 -translate-y-3">
                    {combinedLatest.map((post, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <button
                          key={post.slug ?? index}
                          onClick={() => handleManualSelection(index)}
                          className={`rounded-full transition-all duration-300 ${
                            isActive
                              ? "bg-orange-500"
                              : "bg-orange-500/30 hover:bg-orange-500/60"
                          }`}
                          style={{
                            width: isActive ? "1.75rem" : "0.75rem",
                            height: "0.75rem",
                          }}
                          aria-label={`View blog ${index + 1}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid h-full gap-5 lg:grid-rows-[0.28fr_1fr_0.72fr]">
                <LandingTagsCard tags={curatedTags} className="h-full text-[13px] sm:text-sm" />
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
        <TopBlogs communityPosts={communityPosts} technologyPosts={technologyPosts} />
        <Testimonials />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allCommunityPosts = await getAllPostsForCommunity(preview);
  const allTechnologyPosts = await getAllPostsForTechnology(preview);
  const allTags = await getAllTags();

  return {
    props: {
      communityPosts:
        allCommunityPosts?.edges?.length > 3
          ? allCommunityPosts?.edges?.slice(0, 3)
          : allCommunityPosts?.edges ?? [],
      technologyPosts:
        allTechnologyPosts?.edges?.length > 3
          ? allTechnologyPosts?.edges?.slice(0, 3)
          : allTechnologyPosts?.edges ?? [],
      tags: Array.isArray(allTags) ? allTags : [],
      preview,
    },
    revalidate: 10,
  };
};