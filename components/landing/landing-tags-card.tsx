import Link from "next/link";
import { Tag as TagIcon } from "lucide-react";

type LandingTag = {
  name: string;
};

type LandingTagsCardProps = {
  tags: LandingTag[];
  colorPalette?: string[];
  className?: string;
};

const DEFAULT_COLORS = [
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-amber-50 text-amber-800 border-amber-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-sky-50 text-sky-700 border-sky-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-lime-50 text-lime-700 border-lime-200",
];

const getTagSlug = (name: string | undefined) => {
  if (!name) return "";
  return name.replace(/\s+/g, "-").toLowerCase();
};

export default function LandingTagsCard({
  tags,
  colorPalette = DEFAULT_COLORS,
  className = "",
}: LandingTagsCardProps) {
  return (
    <div
      className={`rounded-2xl border border-orange-100 bg-white/95 px-4 py-2.5 sm:px-5 sm:py-3.5 shadow-[0_14px_45px_rgba(15,23,42,0.08)] flex flex-col h-full ${className}`}
    >
      <div className="flex items-center gap-2">
        <TagIcon className="h-4 w-4 text-orange-500" />
        <p className="type-meta text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
          Trending tags
        </p>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <span className="text-sm text-slate-500">No tags available yet.</span>
        ) : (
          tags.map((tag, index) => {
            const colorClass = colorPalette[index % colorPalette.length];
            const slug = getTagSlug(tag.name);
            return (
              <Link key={`${tag.name}-${index}`} href={`/tag/${slug}`}>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:shadow-orange-200 ${colorClass}`}
                >
                  {tag.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
      <div className="mt-auto flex justify-end">
        <Link
          href="/tag"
          className="mt-3 inline-flex items-center text-xs font-semibold text-orange-600 transition-colors hover:text-orange-700"
        >
          View all tags
          <span className="ml-1 text-base">→</span>
        </Link>
      </div>
    </div>
  );
}

