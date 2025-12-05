import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";

const Mention = ({ children }: { children: React.ReactNode }) => (
  <span className="mention">{children}</span>
);

type Testimonial = {
  avatar: string;
  name: string;
  handle: string;
  content: React.ReactNode;
  link?: string;
};

const testimonials: Testimonial[] = Tweets.map((tweet) => {
  const parts = tweet.content.split("@keploy");
  const content = tweet.content.includes("@keploy")
    ? parts.reduce<React.ReactNode[]>((acc, part, idx) => {
        acc.push(part);
        if (idx !== parts.length - 1) {
          acc.push(<Mention key={`${tweet.id}-${idx}`}>@keploy</Mention>);
        }
        return acc;
      }, [])
    : tweet.content;

  return {
    avatar: tweet.avatar,
    name: tweet.name,
    handle: tweet.id,
    content,
    link: tweet.post,
  };
});

const splitIndex = Math.ceil(testimonials.length / 2);
const topRowTestimonials = testimonials.slice(0, splitIndex);
const bottomRowTestimonials = testimonials.slice(splitIndex);

const TestimonialCard = ({ avatar, name, handle, content, link }: Testimonial) => {
  const CardWrapper = link ? "a" : "div";
  const wrapperProps = link ? { href: link, target: "_blank", rel: "noopener noreferrer" } : {};
  const resolvedAvatar = avatar && avatar !== "imag1" && avatar !== "image" ? avatar : "/blog/images/author.png";

  return (
    <CardWrapper
      {...wrapperProps}
      className="testimonial-card group cursor-pointer relative p-5 min-w-[320px] max-w-[380px] flex-shrink-0 border-r border-b border-border bg-transparent transition-all duration-200 hover:bg-orange-50/60 block"
    >
      {link && (
        <div className="absolute top-4 right-4 text-orange-500 group-hover:text-orange-600 transition-all opacity-0 group-hover:opacity-100">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <img
          src={resolvedAvatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover bg-muted"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm leading-tight">{name}</span>
          <span className="text-muted-foreground text-sm">@{handle}</span>
        </div>
      </div>

      <div className="h-px bg-border/80 my-3 -mx-5" />

      <p className="text-foreground text-sm leading-relaxed">{content}</p>
    </CardWrapper>
  );
};

const TwitterTestimonials = () => {
  const [isTopPaused, setIsTopPaused] = useState(false);
  const [isBottomPaused, setIsBottomPaused] = useState(false);

  return (
    <section className="py-16 md:py-24 overflow-hidden relative">
      <div className="container mx-auto px-4 mb-12">
        <h2 className="type-section-title relative inline-block whitespace-nowrap text-3xl md:text-4xl lg:text-[2.25rem] tracking-[-0.01em] leading-snug text-gray-700 text-left">
          <span className="relative z-10">What our community thinks</span>
          <span className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-orange-200/80 to-orange-100/80 -z-0" />
        </h2>
      </div>

      <div
        className="marquee-row mask-gradient-x border-t border-border"
        onMouseEnter={() => setIsTopPaused(true)}
        onMouseLeave={() => setIsTopPaused(false)}
      >
        <div
          className="flex animate-[marquee-left_28s_linear_infinite]"
          style={{ animationPlayState: isTopPaused ? "paused" : "running" }}
        >
          {[...topRowTestimonials, ...topRowTestimonials].map((testimonial, index) => (
            <TestimonialCard key={`top-${index}`} {...testimonial} />
          ))}
        </div>
      </div>

      <div
        className="marquee-row mask-gradient-x border-b border-border"
        onMouseEnter={() => setIsBottomPaused(true)}
        onMouseLeave={() => setIsBottomPaused(false)}
      >
        <div
          className="flex animate-[marquee-right_28s_linear_infinite]"
          style={{ animationPlayState: isBottomPaused ? "paused" : "running" }}
        >
          {[...bottomRowTestimonials, ...bottomRowTestimonials].map((testimonial, index) => (
            <TestimonialCard key={`bottom-${index}`} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TwitterTestimonials;
