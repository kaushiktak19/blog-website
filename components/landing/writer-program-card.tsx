import Link from "next/link";
import { PenLine } from "lucide-react";

type LandingWriterProgramCardProps = {
  className?: string;
};

export default function LandingWriterProgramCard({ className = "" }: LandingWriterProgramCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-orange-100 bg-[#fff8f0] text-slate-900 px-5 py-5 shadow-[0_6px_18px_rgba(15,23,42,0.05)] min-h-[190px] ${className}`}
    >
      <div className="space-y-1">
        <p className="type-meta text-[11px] font-semibold uppercase tracking-[0.26em] text-orange-500">
          Writers program
        </p>
        <h3 className="type-card-title text-base sm:text-lg font-semibold leading-tight text-gray-900">
          Share your engineering story with our builders
        </h3>
        <p className="type-card-excerpt text-[0.86rem] md:text-[0.93rem] text-slate-700 leading-relaxed">
          Pitch a topic, pair with our editorial team, and showcase fresh learnings to mentors, contributors, and meetups across the Keploy community.
        </p>
      </div>
      <Link
        href="https://keploy.notion.site/Writer-Program"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center justify-center rounded-full border border-orange-200 bg-white text-orange-700 px-4 py-1.5 text-xs font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition hover:bg-orange-50 hover:border-orange-300 hover:text-orange-800 hover:shadow-[0_7px_18px_rgba(15,23,42,0.14)]"
      >
        <PenLine className="mr-2 h-4 w-4 text-white" />
        Apply to write
      </Link>
      <span className="pointer-events-none absolute -right-10 -bottom-10 h-20 w-20 rounded-full bg-orange-200/30 blur-3xl" />
    </div>
  );
}

