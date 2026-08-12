import { Target, TrendingUp, Loader2, Flame, Layers } from "lucide-react";
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
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Objective performance metrics, variance analysis, and consistency tracking.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-1 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border-border/50">
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
        <Card className="rounded-3xl shadow-sm border-border/50">
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

        {/* Last 4 Weeks Trend */}
        <Card className="rounded-3xl shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Last 4 Weeks Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={last4WeeksTrend}
                  margin={{ top: 10, right: 40, left: 10, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="week"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                    tickMargin={10}
                    padding={{ left: 20, right: 20 }}
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

      {/* Monthly Trend Chart */}
      <Card className="rounded-3xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
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
                  formatter={(value: number, name: string) => {
                    if (name === "rate")
                      return [`${value}%`, "Completion Rate"];
                    return [value, name];
                  }}
                />
                <Bar
                  dataKey="rate"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-Habit Breakdown & Consistency Metrics */}
      <Card className="rounded-3xl shadow-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Habit Breakdown & Consistency
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trailing 30-day rates and daily completion stability (standard deviation measure)
              </p>
            </div>
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
                No habits yet. Add habits to view consistency breakdown.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {habitStats.map((habit) => {
                const habitStreak = streakMap[habit.id];
                return (
                  <div
                    key={habit.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-card p-4 border border-border/50 shadow-sm"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xl">{habit.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {habit.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {habit.completions} completions (last 30 days)
                        </p>
                      </div>
                    </div>

                    {/* Consistency measure */}
                    <div
                      className="flex flex-col text-left sm:text-right min-w-[120px]"
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
                    <div className="flex items-center gap-3 min-w-[90px]">
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

                    {/* Rate Bar */}
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all duration-300"
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

      {/* Cross-habit Same-day Correlation */}
      {correlations.length > 0 && (
        <Card className="rounded-3xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg font-semibold">
                  Habits That Tend to Happen Together
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Co-occurrence and lift analysis over the trailing 30 days
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {correlations.map((corr) => (
                <div
                  key={`${corr.habitAId}-${corr.habitBId}`}
                  className="rounded-2xl border border-border/50 bg-card p-4 space-y-2"
                >
                  <p className="text-sm font-semibold text-foreground truncate">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
