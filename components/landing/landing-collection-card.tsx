import Link from "next/link";
import Image from "next/image";
import { Layers, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Accent = "technology" | "community";

type LandingCollectionCardProps = {
  title: string;
  description: string;
  href: string;
  accent: Accent;
  className?: string;
  imageUrls?: string[];
};

const accentMap: Record<
  Accent,
  { badge: string; icon: JSX.Element; gradient: string; fallback: string }
> = {
  technology: {
    badge: "Technology",
    icon: <Layers className="h-5 w-5 text-orange-500" />,
    gradient: "from-orange-100 via-white to-white border-orange-200",
    fallback: "bg-gradient-to-br from-orange-200/60 via-white to-amber-100/70",
  },
  community: {
    badge: "Community",
    icon: <Users className="h-5 w-5 text-rose-500" />,
    gradient: "from-rose-50 via-white to-white border-rose-200",
    fallback: "bg-gradient-to-br from-rose-200/50 via-white to-pink-100/70",
  },
};

export default function LandingCollectionCard({
  title,
  description,
  href,
  accent,
  className = "",
  imageUrls = [],
}: LandingCollectionCardProps) {
  const accentConfig = accentMap[accent];
  const validImages = useMemo(
    () => imageUrls.filter((url): url is string => Boolean(url)),
    [imageUrls]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [validImages.length]);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validImages.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [validImages.length]);

  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-md border border-black/90 bg-gradient-to-br ${accentConfig.gradient} px-4 py-3 sm:px-5 sm:py-4 shadow-md shadow-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-neutral-900/60 ${className}`}
      aria-label={`Browse ${accentConfig.badge} blogs`}
    >
      <div className="relative mb-3 h-32 rounded-sm overflow-hidden">
        {validImages.length > 0 ? (
          <Image
            src={validImages[activeIndex]}
            alt={`${accentConfig.badge} highlight`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-500"
            priority
          />
        ) : (
          <div className={`h-full w-full ${accentConfig.fallback}`} />
        )}
      </div>
      <div className="flex items-center gap-2">
        {accentConfig.icon}
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{accentConfig.badge}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 flex-1 line-clamp-3">{description}</p>
    </Link>
  );
}

