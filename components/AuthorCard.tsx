import Image from "next/image";
import { IoLogoLinkedin } from "react-icons/io";

export type AuthorCardProps = {
  name: string;
  avatarUrl?: string;
  bio?: string;
  linkedin?: string;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

export default function AuthorCard({
  name,
  avatarUrl,
  bio,
  linkedin,
}: AuthorCardProps) {
  const displayBio = bio || `Articles by ${name} on testing, DevTools and more.`;
  const hasAvatar =
    !!avatarUrl &&
    avatarUrl !== "imag1" &&
    avatarUrl !== "image" &&
    avatarUrl.trim() !== "";

  return (
    <article className="h-full rounded-2xl bg-white/95 border border-orange-100 shadow-[0_14px_45px_rgba(15,23,42,0.08)] transition-all duration-300 overflow-hidden hover:border-orange-300 hover:shadow-[0_22px_70px_rgba(15,23,42,0.12)] hover:-translate-y-1.5 flex flex-col group">
      <div className="w-full h-52 relative">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-orange-100/70 via-orange-50/60 to-orange-200/70" />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105">
            {hasAvatar ? (
              <Image
                src={avatarUrl as string}
                alt={`${name}'s Avatar`}
                className="w-full h-full object-cover object-center"
                height={144}
                width={144}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {getInitials(name)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-6 h-0.5 bg-gradient-to-r from-orange-300/20 via-orange-500/40 to-orange-300/20" />

      <div className="px-6 py-5 flex flex-col flex-1 gap-3.5">
        <div className="flex items-start justify-between">
          <h2 className="type-card-title text-xl md:text-2xl text-gray-800 font-medium leading-tight flex-1 pr-2 group-hover:text-orange-600 transition-colors duration-200">
            {name}
          </h2>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} LinkedIn`}
              className="text-gray-400 transition-colors hover:text-orange-600 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <IoLogoLinkedin className="h-5 w-5" />
            </a>
          )}
        </div>

        <div
          className="type-card-excerpt text-[0.88rem] md:text-[0.95rem] text-slate-600 leading-relaxed overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {displayBio}
        </div>
      </div>
    </article>
  );
}


