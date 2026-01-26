import { Calendar, Target, Flame, TrendingUp, Loader2 } from "lucide-react";
import { HabitCheckbox } from "@/components/HabitCheckbox";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useHabits,
  useTodayCompletions,
  useToggleCompletion,
  useHabitStats,
} from "@/hooks/useHabits";

export default function Overview() {
  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const { data: completions = [], isLoading: completionsLoading } =
    useTodayCompletions();
  const { data: stats } = useHabitStats();
  const toggleMutation = useToggleCompletion();

  const isLoading = habitsLoading || completionsLoading;

  // Create a Set of completed habit IDs for quick lookup
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
            <ProgressRing
              progress={progressPercent}
              size={140}
              strokeWidth={10}
            >
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {completedCount}/{totalCount}
                </p>
                <p className="text-xs text-muted-foreground">completed</p>
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

      {/* Today's Habits */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Today's Habits
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
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
            <p className="text-center text-muted-foreground py-8">
              No habits yet. Go to Manage Habits to add some!
            </p>
          ) : (
            habitsWithStatus.map((habit, index) => (
              <div
                key={habit.id}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <HabitCheckbox
                  checked={habit.completedToday}
                  onCheckedChange={() =>
                    toggleHabit(habit.id, habit.completedToday)
                  }
                  label={habit.name}
                  emoji={habit.emoji}
                  disabled={toggleMutation.isPending}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Encouragement */}
      {progressPercent === 100 && totalCount > 0 && (
        <Card
          variant="feature"
          className="border-success/30 bg-success-muted animate-fade-in"
        >
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-2xl">
              🎉
            </div>
            <div>
              <p className="font-semibold text-success">
                All habits completed!
              </p>
              <p className="text-sm text-muted-foreground">
                Amazing work! You're building real consistency.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
