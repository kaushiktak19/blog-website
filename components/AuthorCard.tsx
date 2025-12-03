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
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg shadow-black/10">
      <div className="w-full h-52 relative">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-orange-100/70 via-orange-50/60 to-orange-200/70" />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
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

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight flex-1 pr-2">
            {name}
          </h2>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} LinkedIn`}
              className="text-gray-400 transition-colors hover:text-orange-600 flex-shrink-0"
            >
              <IoLogoLinkedin className="h-5 w-5" />
            </a>
          )}
        </div>

        <div
          className="text-gray-700 text-sm leading-relaxed mb-6 min-h-[4.5rem] overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {displayBio}
        </div>
      </div>
    </div>
  );
}


