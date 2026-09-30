import { useState } from "react";
import { Calendar, Target, Flame, TrendingUp, Loader2, Sparkles, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { HabitCheckbox } from "@/components/HabitCheckbox";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useHabits,
  useTodayCompletions,
  useToggleCompletion,
  useHabitStats,
  useHabitStreakStats,
  useHabitHealthDashboard,
} from "@/hooks/useHabits";
import { HabitHealthDashboard, HealthFilterType } from "@/components/HabitHealthDashboard";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

export default function Overview() {
  const [activeFilter, setActiveFilter] = useState<HealthFilterType>("all");
  const { user } = useAuth();

  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const { data: completions = [], isLoading: completionsLoading } =
    useTodayCompletions();
  const { data: stats } = useHabitStats();
  const { streakMap } = useHabitStreakStats();
  const { data: healthData, isLoading: healthLoading } = useHabitHealthDashboard();
  const toggleMutation = useToggleCompletion();

  const isLoading = habitsLoading || completionsLoading;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const completedHabitIds = new Set(completions.map((c) => c.habit_id));
  const healthMap = healthData?.healthMap || {};
  const healthSummary = healthData?.summary || {
    strongCount: 0,
    onTrackCount: 0,
    atRiskCount: 0,
    ignoredCount: 0,
    newCount: 0,
    totalHabitsCount: habits.length,
    attentionCount: 0,
    doingWellHabits: [],
    needsAttentionHabits: [],
    decliningHabits: [],
    improvingHabits: [],
    bannerMessage: {
      type: "neutral" as const,
      headline: "Track habits to build behavioral insights.",
    },
  };

  // Merge habits with today's completion status & health detail
  const habitsWithStatus = habits.map((habit) => ({
    ...habit,
    completedToday: completedHabitIds.has(habit.id),
    healthDetail: healthMap[habit.id],
  }));

  const completedCount = habitsWithStatus.filter(
    (h) => h.completedToday,
  ).length;
  const totalCount = habitsWithStatus.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter habits according to selected health filter
  const filteredHabits = habitsWithStatus.filter((habit) => {
    if (activeFilter === "all") return true;
    return habit.healthDetail?.health === activeFilter;
  });

  const toggleHabit = (habitId: string, isCurrentlyCompleted: boolean) => {
    toggleMutation.mutate({ habitId, isCurrentlyCompleted });
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Daily overview"
        title={greeting()}
        accent={`${firstName}.`}
        description={
          totalCount > 0
            ? `${completedCount} of ${totalCount} habits done today. Focus on execution, consistency and behavioral health.`
            : "Add your first habit to start building a streak."
        }
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Focus mode enabled
          </span>
        }
      />

      {/* Top Stat Cards */}
      <div className="stagger grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="ambient-panel flex items-center justify-center rounded-[1.7rem] py-6 md:col-span-2 lg:col-span-1">
          <ProgressRing progress={progressPercent} size={140} strokeWidth={10}>
            <div className="text-center">
              <p className="font-display text-4xl font-bold">
                {completedCount}/{totalCount}
              </p>
              <p className="eyebrow mt-1">completed</p>
            </div>
          </ProgressRing>
        </div>

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

      {/* 100% Completion Celebration Banner */}
      {progressPercent === 100 && totalCount > 0 && (
        <div className="page-enter flex items-center gap-4 rounded-[1.7rem] border border-success/30 bg-success-muted p-5 shadow-soft">
          <div className="check-pop flex h-11 w-11 items-center justify-center rounded-2xl bg-success text-success-foreground">
            <PartyPopper className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-success">100% complete</p>
            <p className="text-sm text-muted-foreground">All habits completed for today.</p>
          </div>
        </div>
      )}

      {/* Habit Health Dashboard & Consistency Summary */}
      <HabitHealthDashboard
        summary={healthSummary}
        healthMap={healthMap}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalHabitsCount={totalCount}
      />

      {/* Habits List */}
      <section className="ambient-panel rounded-[1.7rem] p-5 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-2xl font-bold">Today&apos;s Habits</h2>
            {activeFilter !== "all" && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
                Filter: {activeFilter.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-border/70 bg-secondary/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:self-auto">
            <Calendar className="h-3.5 w-3.5" />
            <span>{today}</span>
          </div>
        </div>

        {isLoading || healthLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : habitsWithStatus.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-muted-foreground">No habits set up yet.</p>
            <Button asChild size="sm">
              <Link to="/app/habits">Add your first habit</Link>
            </Button>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="space-y-2 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No habits matching filter &quot;{activeFilter.replace("_", " ")}&quot;.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="text-xs text-primary underline hover:bg-transparent"
            >
              Show all habits
            </Button>
          </div>
        ) : (
          <div key={activeFilter} className="stagger space-y-3">
            {filteredHabits.map((habit) => (
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
                  healthDetail={habit.healthDetail}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
