import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────────────────

interface HabitRow {
  id: string;
  name: string;
  emoji: string;
  created_at: string;
}

interface CompletionRow {
  habit_id: string;
  completed_date: string;
}

interface TodoRow {
  completed: boolean;
}

interface AIInsightsResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  motivation: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function dateDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86_400_000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }
  const token = authHeader.slice(7);

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  // Create an authenticated Supabase client using the user's JWT
  // This ensures RLS policies are respected for data queries
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Validate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const since = dateDaysAgo(30);

    // First fetch habits to get IDs
    const habitsRes = await supabase
      .from("habits")
      .select("id, name, emoji, created_at")
      .eq("user_id", user.id)
      .eq("is_archived", false);

    if (habitsRes.error) throw habitsRes.error;
    const habits: HabitRow[] = habitsRes.data ?? [];

    if (habits.length === 0) {
      return res.status(400).json({
        error:
          "No habits found. Create some habits first before generating insights.",
      });
    }

    const habitIds = habits.map((h) => h.id);

    // Now fetch completions (by habit_id) and todos in parallel
    const [completionsRes, todosRes] = await Promise.all([
      supabase
        .from("habit_completions")
        .select("habit_id, completed_date")
        .in("habit_id", habitIds)
        .gte("completed_date", since),
      supabase
        .from("daily_todos")
        .select("completed")
        .eq("user_id", user.id)
        .gte("task_date", since),
    ]);

    if (completionsRes.error) throw completionsRes.error;
    if (todosRes.error) throw todosRes.error;

    const completions: CompletionRow[] = completionsRes.data ?? [];
    const todos: TodoRow[] = todosRes.data ?? [];

    // ── Build summary ──────────────────────────────────────────────────────

    const totalPossible = habits.length * 30;
    const totalCompleted = completions.length;
    const overallRate =
      totalPossible > 0
        ? Math.round((totalCompleted / totalPossible) * 100)
        : 0;

    // Per-habit stats
    const perHabit = habits.map((h) => {
      const hCompletions = completions.filter((c) => c.habit_id === h.id);
      const dates = hCompletions.map((c) => c.completed_date);
      return {
        name: `${h.emoji} ${h.name}`,
        completions: hCompletions.length,
        rate: Math.round((hCompletions.length / 30) * 100),
        streak: computeStreak(dates),
      };
    });

    const bestHabit = perHabit.reduce(
      (best, h) => (h.streak > best.streak ? h : best),
      perHabit[0],
    );
    const weakestHabit = perHabit.reduce(
      (worst, h) => (h.rate < worst.rate ? h : worst),
      perHabit[0],
    );

    const todosCompleted = todos.filter((t) => t.completed).length;
    const todosTotal = todos.length;

    const summaryPayload = {
      period: "last 30 days",
      overallCompletionRate: `${overallRate}%`,
      totalHabits: habits.length,
      totalCompletions: totalCompleted,
      perHabitStats: perHabit.map((h) => ({
        name: h.name,
        rate: `${h.rate}%`,
        streak: `${h.streak} days`,
      })),
      bestStreak: { habit: bestHabit.name, days: bestHabit.streak },
      weakestHabit: { habit: weakestHabit.name, rate: `${weakestHabit.rate}%` },
      todos: { completed: todosCompleted, total: todosTotal },
    };

    // ── Call AI ─────────────────────────────────────────────────────────────

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    const systemPrompt = `You are a helpful habit-tracking coach. Analyze the user's habit data summary and return actionable insights. Always respond with ONLY valid JSON in this exact structure:
{
  "summary": "A 2-3 sentence overview of the user's habit performance",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "motivation": "A short motivational message tailored to their progress"
}
Do NOT include any text outside the JSON. Do NOT wrap in markdown code blocks.`;

    const userPrompt = `Here is my habit tracking data for the ${summaryPayload.period}:\n\n${JSON.stringify(summaryPayload, null, 2)}\n\nPlease analyze this and provide insights.`;

    const aiRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!aiRes.ok) {
      const errBody = await aiRes.text();
      console.error("Groq API error:", aiRes.status, errBody);
      return res.status(502).json({ error: "AI service request failed" });
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: "Empty response from AI" });
    }

    let insights: AIInsightsResponse;
    try {
      insights = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return res.status(502).json({ error: "Invalid response from AI" });
    }

    // Validate shape
    if (
      !insights.summary ||
      !Array.isArray(insights.strengths) ||
      !Array.isArray(insights.weaknesses) ||
      !Array.isArray(insights.suggestions) ||
      !insights.motivation
    ) {
      return res.status(502).json({ error: "Malformed AI response" });
    }

    return res.status(200).json(insights);
  } catch (err: any) {
    console.error("AI insights error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
