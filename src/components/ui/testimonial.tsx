import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8",
        className,
      )}
    >
      {items.map((item, index) => {
        const days = Number.parseInt(item.streak, 10);
        return (
          <div
            key={item.id ?? index}
            data-reveal
            style={{ "--d": `${index * 110}ms` } as CSSProperties}
            className="flex"
          >
            <figure className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-soft-lg">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.author}
                  loading="lazy"
                  className={cn(
                    "h-full w-full object-cover grayscale-[30%] transition duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0",
                    item.imagePosition || "object-center",
                  )}
                />
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="flex items-baseline gap-2 border-b border-border pb-4">
                  {Number.isNaN(days) ? (
                    <span className="text-sm font-semibold">{item.streak}</span>
                  ) : (
                    <>
                      <span className="type-number text-5xl">{days}</span>
                      <span className="eyebrow">Day streak</span>
                    </>
                  )}
                </p>

                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/90">
                  {item.quote}
                </blockquote>

                <figcaption className="mt-6">
                  <p className="font-semibold text-foreground">{item.author}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.role}</p>
                </figcaption>
              </div>
            </figure>
          </div>
        );
      })}
    </div>
  );
}

export { Example as Testimonial };
