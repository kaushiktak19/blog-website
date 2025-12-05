import Link from "next/link";
import Image from "next/image";
import { Cpu, Users2 } from "lucide-react";
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
    icon: (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-[0_2px_6px_rgba(15,23,42,0.1)]">
        <Cpu className="h-5 w-5 text-orange-500" />
      </span>
    ),
    gradient: "from-orange-100 via-white to-white border-orange-200",
    fallback: "bg-gradient-to-br from-orange-200/60 via-white to-amber-100/70",
  },
  community: {
    badge: "Community",
    icon: (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-[0_2px_6px_rgba(15,23,42,0.1)]">
        <Users2 className="h-5 w-5 text-rose-500" />
      </span>
    ),
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
      className={`group relative flex flex-col rounded-2xl border border-orange-100 bg-gradient-to-br ${accentConfig.gradient} px-5 pt-4 pb-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-[0_26px_80px_rgba(15,23,42,0.14)] ${className}`}
      aria-label={`Browse ${accentConfig.badge} blogs`}
    >
      <div className="relative mb-3 h-32 rounded-xl overflow-hidden bg-slate-100/60">
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
      <div className="flex items-center gap-3 px-1 mb-3">
        {accentConfig.icon}
        <p className="type-meta text-sm md:text-base font-extrabold uppercase tracking-[0.28em] text-slate-900">
          {accentConfig.badge}
        </p>
      </div>
      <p className="text-[0.9rem] md:text-[0.95rem] leading-relaxed text-slate-500 overflow-hidden px-1 mb-0" style={{ 
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        lineHeight: '1.5',
        maxHeight: '4.5rem'
      }}>
        {description}
      </p>
    </Link>
  );
}

