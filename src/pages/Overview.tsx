import { useState } from "react"
import { Calendar, Target, Flame, TrendingUp } from "lucide-react"
import { HabitCheckbox } from "@/components/HabitCheckbox"
import { ProgressRing } from "@/components/ProgressRing"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Habit {
  id: string
  name: string
  emoji?: string
  completed: boolean
}

const initialHabits: Habit[] = [
  { id: "1", name: "Morning meditation", emoji: "🧘", completed: false },
  { id: "2", name: "Read for 30 minutes", emoji: "📚", completed: true },
  { id: "3", name: "Exercise", emoji: "💪", completed: false },
  { id: "4", name: "Drink 8 glasses of water", emoji: "💧", completed: true },
  { id: "5", name: "Journal before bed", emoji: "📝", completed: false },
]

export default function Overview() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)

  const completedCount = habits.filter((h) => h.completed).length
  const totalCount = habits.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    )
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Good morning! ☀️</h1>
        <p className="text-muted-foreground mt-1">
          Let's build some consistency today.
        </p>
      </div>

      {/* Progress & Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Daily Progress */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center justify-center py-6">
            <ProgressRing progress={progressPercent} size={140} strokeWidth={10}>
              <div className="text-center">
                <p className="text-3xl font-bold">{completedCount}/{totalCount}</p>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
            </ProgressRing>
          </CardContent>
        </Card>

        <StatCard
          label="Current Streak"
          value="12 days"
          sublabel="+2 from last week"
          trend="up"
          icon={Flame}
        />
        <StatCard
          label="This Week"
          value="85%"
          sublabel="Completion rate"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          label="Total Habits"
          value={totalCount}
          sublabel="Active habits"
          icon={Target}
        />
      </div>

      {/* Today's Habits */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Today's Habits</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{today}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {habits.map((habit, index) => (
            <div
              key={habit.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <HabitCheckbox
                checked={habit.completed}
                onCheckedChange={() => toggleHabit(habit.id)}
                label={habit.name}
                emoji={habit.emoji}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Encouragement */}
      {progressPercent === 100 && (
        <Card variant="feature" className="border-success/30 bg-success-muted animate-fade-in">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-2xl">
              🎉
            </div>
            <div>
              <p className="font-semibold text-success">All habits completed!</p>
              <p className="text-sm text-muted-foreground">
                Amazing work! You're building real consistency.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
