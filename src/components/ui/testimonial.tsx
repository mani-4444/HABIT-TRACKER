import type { CSSProperties } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = ["--tone-orange", "--tone-mint", "--tone-rose"];

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
            style={{ "--d": `${index * 110}ms`, "--tone": `var(${TONES[index % TONES.length]})` } as CSSProperties}
            className="flex"
          >
            <figure className="ambient-panel group flex w-full flex-col overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-28px_hsl(var(--tone)/0.8)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.author}
                  loading="lazy"
                  className={cn(
                    "h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]",
                    item.imagePosition || "object-center",
                  )}
                />
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                {Number.isNaN(days) ? (
                  <p className="text-sm font-bold">{item.streak}</p>
                ) : (
                  <p className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[hsl(var(--tone)/0.13)] px-3.5 py-2 text-[hsl(var(--tone))]">
                    <Flame className="h-5 w-5" strokeWidth={2.4} />
                    <span className="type-number text-3xl">{days}</span>
                    <span className="text-xs font-semibold text-muted-foreground">day streak</span>
                  </p>
                )}

                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/90">
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
