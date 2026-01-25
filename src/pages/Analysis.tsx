import { Calendar, Target, TrendingUp, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/StatCard"
import { ProgressRing } from "@/components/ProgressRing"
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
} from "recharts"

const weeklyData = [
  { day: "Mon", completed: 4, total: 5 },
  { day: "Tue", completed: 5, total: 5 },
  { day: "Wed", completed: 3, total: 5 },
  { day: "Thu", completed: 5, total: 5 },
  { day: "Fri", completed: 4, total: 5 },
  { day: "Sat", completed: 5, total: 5 },
  { day: "Sun", completed: 2, total: 5 },
]

const monthlyData = [
  { week: "Week 1", rate: 72 },
  { week: "Week 2", rate: 80 },
  { week: "Week 3", rate: 85 },
  { week: "Week 4", rate: 81 },
]

const habitStats = [
  { name: "Morning meditation", emoji: "🧘", rate: 92, streak: 14 },
  { name: "Read for 30 minutes", emoji: "📚", rate: 85, streak: 8 },
  { name: "Exercise", emoji: "💪", rate: 78, streak: 5 },
  { name: "Drink 8 glasses of water", emoji: "💧", rate: 95, streak: 21 },
  { name: "Journal before bed", emoji: "📝", rate: 68, streak: 3 },
]

export default function Analysis() {
  const overallRate = Math.round(
    habitStats.reduce((sum, h) => sum + h.rate, 0) / habitStats.length
  )

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
          label="Total Days Tracked"
          value="45"
          sublabel="Since you started"
          icon={Calendar}
        />
        <StatCard
          label="Habits Completed"
          value="189"
          sublabel="All time"
          trend="up"
          icon={Target}
        />
        <StatCard
          label="Best Streak"
          value="21 days"
          sublabel="Drinking water"
          trend="up"
          icon={TrendingUp}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
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
            <CardTitle className="text-lg font-semibold">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
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
          <CardTitle className="text-lg font-semibold">Habit Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habitStats.map((habit, index) => (
              <div
                key={habit.name}
                className="flex items-center gap-4 animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xl">{habit.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {habit.streak} day streak
                  </p>
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
            ))}
          </div>
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
  )
}
