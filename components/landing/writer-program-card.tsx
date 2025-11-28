import Link from "next/link";
import { PenLine } from "lucide-react";

type LandingWriterProgramCardProps = {
  className?: string;
};

export default function LandingWriterProgramCard({ className = "" }: LandingWriterProgramCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-md border border-black/90 bg-[#fff4e8] text-slate-900 px-4 py-2.5 sm:px-5 sm:py-3.5 shadow-md shadow-neutral-900 min-h-[190px] ${className}`}
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-orange-500">Writer program</p>
        <h3 className="text-base sm:text-lg font-bold leading-tight">
          Share your engineering story with our builders
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          Pitch a topic, pair with our editorial team, and showcase fresh learnings to mentors, contributors, and meetups across the Keploy community.
        </p>
      </div>
      <Link
        href="https://keploy.notion.site/Writer-Program"
        target="_blank"
        rel="noreferrer"
        className="mt-0.5 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 via-rose-500 to-orange-400 text-white px-3 py-1.5 text-xs font-semibold shadow-md shadow-orange-200 transition hover:brightness-110"
      >
        <PenLine className="mr-2 h-4 w-4 text-white" />
        Apply to write
      </Link>
      <span className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange-200/50 blur-3xl" />
    </div>
  );
}

