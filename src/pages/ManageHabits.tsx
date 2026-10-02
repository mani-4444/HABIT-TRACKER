import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useHabits,
  useAddHabit,
  useUpdateHabit,
  useDeleteHabit,
} from "@/hooks/useHabits";

const emojiOptions = [
  // Productivity / Study
  "📚","📝","📖","✍️","💻","📅","🗓️","📌","📍","🧠","🔍","📊","📈","📉","🗂️","📁",

  // Fitness / Health
  "💪","🏋️","🏃","🚴","🧘","🤸","🏊","🥗","🍎","🥑","🥦","🍗","🥤","💧","🩺","😴",

  // Mental health / Mindfulness
  "🌿","🌱","🌸","🕯️","🙏","💆","🧠","💖","😊","😌","✨","🌙","☀️","⭐",

  // Habits / Goals
  "🎯","🏆","🔥","⚡","📍","✅","📌","⏳","🕒","📆","🔔","💡",

  // Cleaning / Home
  "🧹","🧼","🧽","🧺","🛏️","🧴","🚿","🧻","🏠","🪣","🧯",

  // Money / Finance
  "💰","💳","🏦","📉","📈","🪙","🧾","💵","💸",

  // Food / Cooking
  "🍳","🥘","🍲","🍜","🥪","🍞","🍚","🍴","☕","🍵",

  // Social / Relationships
  "📞","💬","👨‍👩‍👧‍👦","🤝","❤️","💌","🎉","🎁",

  // Creative / Hobbies
  "🎨","🎵","🎸","🎹","🎧","📷","🎬","🧩","🎮","🧶","✂️",

  // Outdoor / Nature
  "🌳","🏕️","⛰️","🌊","☀️","🌧️","❄️","🌈","🌍",

  // Travel / Routine
  "🚶","🚗","🚌","🚆","✈️","🧳","📍",

  // Reading / Learning
  "📖","📚","🎓","🧪","🔬","🧮","📐","🌍",

  // Fun / Motivation
  "😄","🤩","🥳","🙌","💥","🎊","🌟","✨","🔥"
];

// The list above repeats a few emojis across categories; show each once.
const uniqueEmojis = Array.from(new Set(emojiOptions));

export default function ManageHabits() {
  const { data: habits = [], isLoading, error } = useHabits();
  const addHabitMutation = useAddHabit();
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();

  const [newHabit, setNewHabit] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("⭐");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const addHabit = () => {
    if (!newHabit.trim()) return;

    addHabitMutation.mutate(
      { name: newHabit.trim(), emoji: selectedEmoji },
      {
        onSuccess: () => {
          setNewHabit("");
          setSelectedEmoji("⭐");
        },
      },
    );
  };

  const confirmDeleteHabit = () => {
    if (!habitToDelete) return;
    deleteHabitMutation.mutate(habitToDelete, {
      onSettled: () => setHabitToDelete(null),
    });
  };

  const startEdit = (habit: { id: string; name: string }) => {
    setEditingId(habit.id);
    setEditValue(habit.name);
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) return;

    updateHabitMutation.mutate(
      { id, name: editValue.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditValue("");
        },
      },
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">
          Failed to load habits. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage habits"
        title="Your"
        accent="habits."
        description="Add, edit, or remove your daily habits."
      />

      {/* Add Habit Form */}
      <section className="ambient-panel rounded-[1.7rem] p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold">Add a new habit</h2>

        <div className="mt-4 space-y-2">
          <Label htmlFor="habit-name">Habit name</Label>
          <div className="flex gap-2">
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-background/80 text-2xl"
            >
              {selectedEmoji}
            </span>
            <Input
              id="habit-name"
              placeholder="e.g., Practice guitar for 15 minutes"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              className="h-12 rounded-xl border-border/75 bg-background/80 text-base"
              disabled={addHabitMutation.isPending}
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p id="emoji-label" className="text-sm font-medium">
            Choose an emoji <span className="font-normal text-muted-foreground">(optional)</span>
          </p>
          <div
            role="group"
            aria-labelledby="emoji-label"
            className="grid max-h-44 grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1.5 overflow-y-auto rounded-2xl border border-border/60 bg-background/50 p-2"
          >
            {uniqueEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Use ${emoji}`}
                aria-pressed={selectedEmoji === emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={cn(
                  "flex h-10 items-center justify-center rounded-xl text-xl transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selectedEmoji === emoji
                    ? "bg-primary/20 ring-2 ring-primary"
                    : "hover:bg-accent/60",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={addHabit}
          disabled={!newHabit.trim() || addHabitMutation.isPending}
          className="mt-5 h-11 w-full rounded-xl sm:w-auto"
        >
          {addHabitMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {addHabitMutation.isPending ? "Adding..." : "Add Habit"}
        </Button>
      </section>

      {/* Habits List */}
      <section className="ambient-panel rounded-[1.7rem] p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl font-bold">
          Your habits <span className="text-muted-foreground">({habits.length})</span>
        </h2>
        {habits.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No habits yet. Add your first habit above!
          </p>
        ) : (
          <div className="stagger space-y-2.5">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="group flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/80 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-soft sm:p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                  {habit.emoji}
                </span>

                {editingId === habit.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={editValue}
                      aria-label="Habit name"
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(habit.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="h-9 rounded-lg"
                      autoFocus
                      disabled={updateHabitMutation.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Save"
                      onClick={() => saveEdit(habit.id)}
                      className="h-9 w-9 shrink-0"
                      disabled={updateHabitMutation.isPending}
                    >
                      {updateHabitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-success" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Cancel"
                      onClick={cancelEdit}
                      className="h-9 w-9 shrink-0"
                      disabled={updateHabitMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-semibold">
                      {habit.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Rename ${habit.name}`}
                        onClick={() => startEdit(habit)}
                        className="h-9 w-9"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${habit.name}`}
                        onClick={() => setHabitToDelete(habit.id)}
                        className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                        disabled={deleteHabitMutation.isPending}
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
      </section>

      {/* Delete Habit Confirmation Dialog */}
      <AlertDialog
        open={habitToDelete !== null}
        onOpenChange={(open) => { if (!open) setHabitToDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit and{" "}
              <strong>all of its completion history</strong>. Your streaks and
              past records for this habit cannot be recovered. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteHabitMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteHabit}
              disabled={deleteHabitMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteHabitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
