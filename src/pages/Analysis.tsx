import { useState, type ReactNode } from "react";
import { Target, TrendingUp, Loader2, Flame, Layers, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { PageHeader } from "@/components/PageHeader";
import { HabitActivityModal } from "@/components/HabitActivityModal";
import { useAnalytics, useHabitStreakStats, useHabits } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const axisTick = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };
const tooltipProps = {
  contentStyle: {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "14px",
    boxShadow: "var(--shadow-soft)",
    padding: "8px 12px",
  },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
  itemStyle: { color: "hsl(var(--foreground))" },
  cursor: { fill: "hsl(var(--primary) / 0.06)" },
};

function ChartCard({ title, subtitle, className, children }: { title: string; subtitle?: string; className?: string; children: ReactNode }) {
  return (
    <section className={cn("ambient-panel rounded-[1.7rem] p-5 sm:p-6", className)}>
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Analysis() {
  const [selectedHabitForDetails, setSelectedHabitForDetails] = useState<string | null>(null);
  const { data: habitsList } = useHabits();
  const { data: analytics, isLoading, error } = useAnalytics();
  const {
    overall: streakStats,
    streakMap,
    isLoading: streakLoading,
  } = useHabitStreakStats();

  if (isLoading || streakLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Failed to load analytics data.</p>
      </div>
    );
  }

  const {
    weeklyData,
    last4WeeksTrend,
    monthlyTrend,
    habitStats,
    correlations,
    totalCompletions,
    overallRate,
  } = analytics || {
    weeklyData: [],
    last4WeeksTrend: [],
    monthlyTrend: [],
    habitStats: [],
    correlations: [],
    totalCompletions: 0,
    overallRate: 0,
  };

  const bestStreak = streakStats?.bestStreak || { days: 0, habitName: "-" };
  const currentStreak = streakStats?.currentStreak || {
    days: 0,
    habitName: "-",
  };

  const hasData = habitStats.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analysis"
        title="How you're"
        accent="trending."
        description="Objective performance metrics, variance analysis, and consistency tracking."
      />

      {/* Overview Stats */}
      <div className="stagger grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="ambient-panel flex items-center justify-center rounded-[1.7rem] py-6 md:col-span-2 lg:col-span-1">
          <ProgressRing progress={overallRate} size={124} strokeWidth={10}>
            <div className="text-center">
              <p className="font-display text-3xl font-bold">{overallRate}%</p>
              <p className="eyebrow mt-0.5">overall</p>
            </div>
          </ProgressRing>
        </div>

        <StatCard
          label="Current Streak"
          value={`${currentStreak.days} day${currentStreak.days !== 1 ? "s" : ""}`}
          sublabel={
            currentStreak.days > 0
              ? currentStreak.habitName
              : "No active streak"
          }
          trend={currentStreak.days > 0 ? "up" : "neutral"}
          icon={Flame}
        />
        <StatCard
          label="Best Streak"
          value={`${bestStreak.days} day${bestStreak.days !== 1 ? "s" : ""}`}
          sublabel={
            bestStreak.days > 0 ? bestStreak.habitName : "No streak yet"
          }
          trend={bestStreak.days > 0 ? "up" : undefined}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Completions"
          value={String(totalCompletions)}
          sublabel="Last 30 days"
          trend={totalCompletions > 0 ? "up" : undefined}
          icon={Target}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="This Week" subtitle="Habits completed each day">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="weekBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Bar
                  dataKey="completed"
                  fill="url(#weekBar)"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={38}
                  name="Completed"
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Last 4 Weeks Trend" subtitle="Completion rate per week">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last4WeeksTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="week"
                  tick={{ ...axisTick, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickMargin={10}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  {...tooltipProps}
                  cursor={{ stroke: "hsl(var(--primary) / 0.4)", strokeWidth: 1 }}
                  formatter={(value: number) => [`${value}%`, "Completion Rate"]}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#trendFill)"
                  dot={{ r: 4, fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Trend" subtitle="Completion rate per month">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="monthBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                {...tooltipProps}
                formatter={(value: number, name: string) => {
                  if (name === "rate")
                    return [`${value}%`, "Completion Rate"];
                  return [value, name];
                }}
              />
              <Bar
                dataKey="rate"
                fill="url(#monthBar)"
                radius={[8, 8, 4, 4]}
                maxBarSize={44}
                name="rate"
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Per-Habit Breakdown & Consistency Metrics */}
      <section className="ambient-panel rounded-[1.7rem] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold">Habit Breakdown & Consistency</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Trailing 30-day rates and daily completion stability (standard deviation measure)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-tone-sky" />
              <span>Best</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {!hasData ? (
            <p className="py-8 text-center text-muted-foreground">
              No habits yet. Add habits to view consistency breakdown.
            </p>
          ) : (
            <div className="stagger space-y-2.5">
              {habitStats.map((habit) => {
                const habitStreak = streakMap[habit.id];
                return (
                  <div
                    key={habit.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-soft sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                        {habit.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {habit.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {habit.completions} completions (last 30 days)
                        </p>
                      </div>
                    </div>

                    {/* Consistency measure */}
                    <div
                      className="flex min-w-[120px] flex-col text-left sm:text-right"
                      title={`Standard deviation of daily completions over 30 days: ${habit.stdDev}`}
                    >
                      <span className="text-xs font-semibold text-foreground">
                        Consistency: {habit.consistencyScore}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Variance (σ): {habit.stdDev}
                      </span>
                    </div>

                    {/* Streak indicators */}
                    <div className="flex min-w-[90px] items-center gap-3">
                      {habitStreak && (
                        <>
                          <div className="flex items-center gap-1" title="Current Streak">
                            <Flame className="h-4 w-4 text-primary" />
                            <span className="w-6 text-sm font-semibold">
                              {habitStreak.currentStreak}
                            </span>
                          </div>
                          <div className="flex items-center gap-1" title="Best Streak">
                            <TrendingUp className="h-4 w-4 text-tone-sky" />
                            <span className="w-6 text-sm font-semibold">
                              {habitStreak.bestStreak}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Rate Bar */}
                    <div className="flex min-w-[130px] items-center gap-3">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-success to-chart-2 transition-all duration-700"
                          style={{ width: `${habit.rate}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold">
                        {habit.rate}%
                      </span>
                    </div>

                    {/* View Details / Heatmap Action */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHabitForDetails(habit.id)}
                      className="h-8 shrink-0 gap-1.5 rounded-xl px-3 text-xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    >
                      <Activity className="h-3.5 w-3.5 text-primary" />
                      <span>View Details</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cross-habit Same-day Correlation */}
      {correlations.length > 0 && (
        <section className="ambient-panel rounded-[1.7rem] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Habits That Tend to Happen Together</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Co-occurrence and lift analysis over the trailing 30 days
              </p>
            </div>
          </div>
          <div className="stagger mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {correlations.map((corr) => (
              <div
                key={`${corr.habitAId}-${corr.habitBId}`}
                className="space-y-2 rounded-2xl border border-border/60 bg-card/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
              >
                <p className="truncate text-sm font-semibold text-foreground">
                  {corr.habitAName} + {corr.habitBName}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Joint completions:</span>
                  <span className="font-medium text-foreground">
                    {corr.coOccurrenceCount} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Co-occurrence rate:</span>
                  <span className="font-medium text-foreground">
                    {corr.togetherRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Co-occurrence Lift:</span>
                  <span className="font-semibold text-primary">
                    {corr.lift}x baseline
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LeetCode-style Habit Activity Heatmap Modal */}
      <HabitActivityModal
        isOpen={!!selectedHabitForDetails}
        onClose={() => setSelectedHabitForDetails(null)}
        initialHabitId={selectedHabitForDetails}
        habits={
          habitsList && habitsList.length > 0
            ? habitsList
            : habitStats.map((h) => ({ id: h.id, name: h.name, emoji: h.emoji }))
        }
      />
    </div>
  );
}
