import { useState } from "react"
import { Plus, Pencil, Trash2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Habit {
  id: string
  name: string
  emoji: string
}

const emojiOptions = ["📚", "💪", "🧘", "💧", "📝", "🎯", "🌱", "⭐", "🏃", "🎨"]

const initialHabits: Habit[] = [
  { id: "1", name: "Morning meditation", emoji: "🧘" },
  { id: "2", name: "Read for 30 minutes", emoji: "📚" },
  { id: "3", name: "Exercise", emoji: "💪" },
  { id: "4", name: "Drink 8 glasses of water", emoji: "💧" },
  { id: "5", name: "Journal before bed", emoji: "📝" },
]

export default function ManageHabits() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [newHabit, setNewHabit] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("⭐")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const addHabit = () => {
    if (!newHabit.trim()) return
    
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.trim(),
      emoji: selectedEmoji,
    }
    
    setHabits([...habits, habit])
    setNewHabit("")
    setSelectedEmoji("⭐")
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id))
  }

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id)
    setEditValue(habit.name)
  }

  const saveEdit = (id: string) => {
    if (!editValue.trim()) return
    
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, name: editValue.trim() } : h
      )
    )
    setEditingId(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue("")
  }

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Manage Habits</h1>
        <p className="text-muted-foreground mt-1">
          Add, edit, or remove your daily habits.
        </p>
      </div>

      {/* Add Habit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Add New Habit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Practice guitar for 15 minutes"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Choose an Emoji (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all ${
                    selectedEmoji === emoji
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={addHabit} disabled={!newHabit.trim()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button>
        </CardContent>
      </Card>

      {/* Habits List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Your Habits ({habits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No habits yet. Add your first habit above!
            </p>
          ) : (
            <div className="space-y-3">
              {habits.map((habit, index) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-xl">{habit.emoji}</span>
                  
                  {editingId === habit.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(habit.id)
                          if (e.key === "Escape") cancelEdit()
                        }}
                        className="h-9"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveEdit(habit.id)}
                        className="h-9 w-9 shrink-0"
                      >
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEdit}
                        className="h-9 w-9 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">{habit.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(habit)}
                          className="h-9 w-9"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHabit(habit.id)}
                          className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
