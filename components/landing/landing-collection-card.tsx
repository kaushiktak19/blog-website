import Link from "next/link";
import { Layers, Users } from "lucide-react";

type Accent = "technology" | "community";

type LandingCollectionCardProps = {
  title: string;
  description: string;
  href: string;
  accent: Accent;
  className?: string;
};

const accentMap: Record<Accent, { badge: string; icon: JSX.Element; gradient: string }> = {
  technology: {
    badge: "Technology",
    icon: <Layers className="h-5 w-5 text-orange-500" />,
    gradient: "from-orange-100 via-white to-white border-orange-200",
  },
  community: {
    badge: "Community",
    icon: <Users className="h-5 w-5 text-rose-500" />,
    gradient: "from-rose-50 via-white to-white border-rose-200",
  },
};

export default function LandingCollectionCard({
  title,
  description,
  href,
  accent,
  className = "",
}: LandingCollectionCardProps) {
  const accentConfig = accentMap[accent];

  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-md border border-black/90 bg-gradient-to-br ${accentConfig.gradient} px-4 py-3 sm:px-5 sm:py-4 shadow-md shadow-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-none ${className}`}
    >
      <div className="flex items-center gap-2">
        {accentConfig.icon}
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{accentConfig.badge}</p>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-slate-900 leading-snug">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 flex-1">{description}</p>
      <span className="mt-2 inline-flex items-center text-xs font-semibold text-orange-600 transition-colors group-hover:text-orange-700">
        Explore
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

