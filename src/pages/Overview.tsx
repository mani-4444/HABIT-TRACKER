import { Calendar, Target, Flame, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { HabitCheckbox } from "@/components/HabitCheckbox";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useHabits,
  useTodayCompletions,
  useToggleCompletion,
  useHabitStats,
  useHabitStreakStats,
} from "@/hooks/useHabits";

export default function Overview() {
  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const { data: completions = [], isLoading: completionsLoading } =
    useTodayCompletions();
  const { data: stats } = useHabitStats();
  const { streakMap } = useHabitStreakStats();
  const toggleMutation = useToggleCompletion();

  const isLoading = habitsLoading || completionsLoading;

  const completedHabitIds = new Set(completions.map((c) => c.habit_id));

  // Merge habits with today's completion status
  const habitsWithStatus = habits.map((habit) => ({
    ...habit,
    completedToday: completedHabitIds.has(habit.id),
  }));

  const completedCount = habitsWithStatus.filter(
    (h) => h.completedToday,
  ).length;
  const totalCount = habitsWithStatus.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleHabit = (habitId: string, isCurrentlyCompleted: boolean) => {
    toggleMutation.mutate({ habitId, isCurrentlyCompleted });
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Daily Overview
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight lg:text-5xl">
            Daily Discipline
          </h1>
          <p className="mt-2 text-muted-foreground">
            Focus on execution and building long-term consistency.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:self-auto">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Focus mode enabled
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-1 rounded-[1.7rem] border-border/50 bg-gradient-to-b from-card to-accent/20 shadow-soft">
          <CardContent className="flex items-center justify-center py-6">
            <ProgressRing
              progress={progressPercent}
              size={140}
              strokeWidth={10}
            >
              <div className="text-center">
                <p className="font-display text-4xl font-bold">
                  {completedCount}/{totalCount}
                </p>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  completed
                </p>
              </div>
            </ProgressRing>
          </CardContent>
        </Card>

        <StatCard
          label="Current Streak"
          value={
            stats?.streak
              ? `${stats.streak} day${stats.streak !== 1 ? "s" : ""}`
              : "0 days"
          }
          sublabel="All habits completed"
          trend={stats?.streak && stats.streak > 0 ? "up" : "neutral"}
          icon={Flame}
        />
        <StatCard
          label="This Week"
          value={`${stats?.weeklyPercentage ?? 0}%`}
          sublabel="Completion rate"
          trend={
            stats?.weeklyPercentage && stats.weeklyPercentage >= 70
              ? "up"
              : "neutral"
          }
          icon={TrendingUp}
        />
        <StatCard
          label="Total Habits"
          value={totalCount}
          sublabel="Active habits"
          icon={Target}
        />
      </div>

      <Card className="rounded-[1.7rem] border-border/55 bg-card/85 shadow-soft">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl font-bold">
              Today&apos;s Habits
            </CardTitle>
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-secondary/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{today}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : habitsWithStatus.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No habits set up yet. Access Manage Habits to add habits.
            </p>
          ) : (
            habitsWithStatus.map((habit) => (
              <div key={habit.id}>
                <HabitCheckbox
                  checked={habit.completedToday}
                  onCheckedChange={() =>
                    toggleHabit(habit.id, habit.completedToday)
                  }
                  label={habit.name}
                  emoji={habit.emoji}
                  disabled={toggleMutation.isPending}
                  streak={streakMap[habit.id]?.currentStreak}
                  isAtRisk={streakMap[habit.id]?.isAtRisk}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {progressPercent === 100 && totalCount > 0 && (
        <Card className="rounded-[1.7rem] border-success/30 bg-success-muted shadow-soft">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground font-bold">
              ✓
            </div>
            <div>
              <p className="font-display text-xl font-bold text-success">
                100% complete
              </p>
              <p className="text-sm text-muted-foreground">
                All habits completed for today.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
