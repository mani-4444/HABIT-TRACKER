import { Link } from "react-router-dom"
import { CheckCircle2, BarChart3, Sparkles, ArrowRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: CheckCircle2,
    title: "Track Daily Habits",
    description: "Simple, satisfying daily check-ins that build lasting routines.",
  },
  {
    icon: BarChart3,
    title: "Visual Progress",
    description: "Clear analytics that show your consistency over time.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Smart suggestions to help you stay on track. Coming soon.",
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">H</span>
          </div>
          <span className="text-lg font-semibold">HabitTracker</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            Build consistency.
            <br />
            <span className="text-primary">One day at a time.</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground text-balance max-w-xl mx-auto">
            A calm, focused habit tracker designed for people who value simplicity 
            and sustainable progress over gamified chaos.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="xl" variant="hero" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="xl" variant="hero-secondary" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
          </div>

          {/* Quote */}
          <div className="mt-16 flex items-start gap-3 text-left max-w-md mx-auto p-4 rounded-xl bg-card/50 border border-border/50">
            <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <blockquote className="text-sm text-muted-foreground italic">
              "Track the habits. The results will follow."
              <footer className="mt-2 text-xs font-medium text-foreground not-italic">
                — Unknown
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20 lg:pb-32">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              variant="feature" 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-xl bg-accent p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-sm font-medium">HabitTracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 HabitTracker. Built for consistency.
          </p>
        </div>
      </footer>
    </div>
  )
}
