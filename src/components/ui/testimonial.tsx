import { cn } from "@/lib/utils";
import { useState } from "react";
import { Flame, Star, CheckCircle2, Quote } from "lucide-react";

export interface TestimonialItem {
  id?: string | number;
  quote: string;
  author: string;
  role: string;
  image: string;
  imagePosition?: string;
  streak: string;
  habitType?: string;
}

export const defaultHabitTestimonials: TestimonialItem[] = [
  {
    id: 1,
    quote:
      "“HabitTracker helped me protect my morning routine. Waking up before sunrise and doing my pooja every day now feels natural, not something I have to force.”",
    author: "Gora",
    role: "Daily Pooja & Morning Discipline",
    image: "/testimonials/gora.jpg",
    imagePosition: "object-[center_20%]",
    streak: "90-Day Streak",
    habitType: "Daily Tracker",
  },
  {
    id: 2,
    quote:
      "“With long hospital days, it was easy to forget my own routines. HabitTracker helped me see the patterns I was missing and stay consistent even on the busiest days.”",
    author: "Geetha",
    role: "Medicine, Wellness & Self-Care",
    image: "/testimonials/geetha.jpg",
    imagePosition: "object-[center_20%]",
    streak: "120-Day Streak",
    habitType: "Daily Tracker",
  },
  {
    id: 3,
    quote:
      "“Discipline is built through repetition. HabitTracker showed me where my consistency was slipping and helped me turn small daily actions into lasting habits.”",
    author: "Dong Lee",
    role: "Martial Arts, Mindset & Discipline",
    image: "/testimonials/dong-lee.jpg",
    imagePosition: "object-[center_15%]",
    streak: "65-Day Streak",
    habitType: "Daily Tracker",
  },
];

export interface TestimonialProps {
  items?: TestimonialItem[];
  className?: string;
}

export default function Example({
  items = defaultHabitTestimonials,
  className,
}: TestimonialProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        .testimonial-font {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
      <div
        className={cn(
          "testimonial-font grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch justify-items-center w-full",
          className
        )}
      >
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={item.id ?? index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "group relative w-full max-w-[360px] flex flex-col justify-between",
                "bg-zinc-950 text-white rounded-3xl border border-zinc-800/80 shadow-xl overflow-hidden",
                "transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5"
              )}
            >
              {/* Image Header with Streak Badge */}
              <div className="relative h-[250px] w-full overflow-hidden bg-zinc-900">
                <img
                  src={item.image}
                  alt={item.author}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                    item.imagePosition || "object-center"
                  )}
                  loading="lazy"
                />

                {/* Subtle top shade for streak badge readability */}
                <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                {/* Bottom smooth cinematic transition */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />

                {/* Streak Badge with Flame Icon */}
                <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300 shadow-md">
                  <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{item.streak}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 flex flex-col justify-between p-5 sm:p-6">
                {/* 5-Star Rating & Subtle Quote Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="ml-1.5 text-xs font-medium text-zinc-400">
                      5.0
                    </span>
                  </div>
                  <Quote className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors duration-300" />
                </div>

                {/* Quote Content */}
                <p className="flex-1 text-[14.5px] leading-relaxed text-zinc-200/95 font-normal pb-5 mb-4 border-b border-zinc-800/80">
                  {item.quote}
                </p>

                {/* Author Metadata */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[15px] font-semibold text-white tracking-tight">
                      {item.author}
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      Verified
                    </span>
                  </div>

                  <p className="text-xs font-medium bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 text-transparent bg-clip-text tracking-wide">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export { Example as Testimonial };
