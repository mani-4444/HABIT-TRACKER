import {
  Calendar,
  Target,
  TrendingUp,
  Sparkles,
  Loader2,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useAnalytics, useHabitStreakStats } from "@/hooks/useHabits";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Analysis() {
  const { data: analytics, isLoading, error } = useAnalytics();
  const {
    overall: streakStats,
    streakMap,
    isLoading: streakLoading,
  } = useHabitStreakStats();

  if (isLoading || streakLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Failed to load analytics data.</p>
      </div>
    );
  }

  const {
    weeklyData,
    monthlyData,
    habitStats,
    totalDaysTracked,
    totalCompletions,
    overallRate,
  } = analytics || {
    weeklyData: [],
    monthlyData: [],
    habitStats: [],
    totalDaysTracked: 0,
    totalCompletions: 0,
    overallRate: 0,
  };

  // Use real streak stats from the dedicated hook
  const bestStreak = streakStats?.bestStreak || { days: 0, habitName: "-" };
  const currentStreak = streakStats?.currentStreak || {
    days: 0,
    habitName: "-",
  };

  const hasData = habitStats.length > 0;

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and reflect on your consistency.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center justify-center py-6">
            <ProgressRing progress={overallRate} size={120} strokeWidth={10}>
              <div className="text-center">
                <p className="text-2xl font-bold">{overallRate}%</p>
                <p className="text-xs text-muted-foreground">overall</p>
              </div>
            </ProgressRing>
          </CardContent>
        </Card>

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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--success))"
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="week"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [
                      `${value}%`,
                      "Completion Rate",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Habit Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Habit Breakdown
            </CardTitle>
            {/* Legend for streak icons */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                <span>Best</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No habits yet. Add habits to see your breakdown.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {habitStats.map((habit, index) => {
                const habitStreak = streakMap[habit.id];
                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-4 animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-xl">{habit.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {habit.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {habit.completions} completions (last 30 days)
                      </p>
                    </div>
                    {/* Streak indicators */}
                    <div className="flex items-center gap-3">
                      {habitStreak && (
                        <>
                          <div
                            className="flex items-center gap-1 text-orange-500"
                            title="Current Streak"
                          >
                            <Flame className="h-4 w-4" />
                            <span className="text-sm font-semibold w-6">
                              {habitStreak.currentStreak}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1 text-blue-500"
                            title="Best Streak"
                          >
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-semibold w-6">
                              {habitStreak.bestStreak}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all duration-500"
                          style={{ width: `${habit.rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {habit.rate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights Placeholder */}
      <Card variant="feature" className="border-primary/20">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">AI Insights</p>
            <p className="text-sm text-muted-foreground">
              Personalized suggestions and pattern recognition coming soon.
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Coming Soon
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
