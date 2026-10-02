import { useState } from "react";
import { Plus, Trash2, Check, Loader2, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useDailyTodos,
  useAddDailyTodo,
  useToggleDailyTodo,
  useDeleteDailyTodo,
  getTodayDateString,
} from "@/hooks/useDailyTodos";

export default function DailyTodos() {
  const [newTask, setNewTask] = useState("");
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const today = getTodayDateString();

  const { data: todos, isLoading, isError, error } = useDailyTodos(today);
  const addTodo = useAddDailyTodo();
  const toggleTodo = useToggleDailyTodo();
  const deleteTodo = useDeleteDailyTodo();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTask = newTask.trim();
    if (!trimmedTask) return;

    addTodo.mutate({
      title: trimmedTask,
      task_date: today,
    });
    setNewTask("");
  };

  const handleToggle = (id: string, currentCompleted: boolean) => {
    toggleTodo.mutate({
      id,
      completed: !currentCompleted,
      task_date: today,
    });
  };

  const confirmDeleteTodo = () => {
    if (!todoToDelete) return;
    deleteTodo.mutate(
      { id: todoToDelete, task_date: today },
      { onSettled: () => setTodoToDelete(null) },
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
        Failed to load todos: {error?.message || "Unknown error"}
      </div>
    );
  }

  const completedCount = todos?.filter((t) => t.completed).length || 0;
  const totalCount = todos?.length || 0;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Today"
        title="Today's"
        accent="to-do list."
        description={
          totalCount > 0
            ? `${completedCount} of ${totalCount} tasks completed`
            : "Plan your day with a simple to-do list"
        }
      />

      {/* Add Task Form + progress */}
      <section className="ambient-panel rounded-[1.7rem] p-5 sm:p-6">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <label htmlFor="new-task" className="sr-only">
            New task
          </label>
          <Input
            id="new-task"
            type="text"
            placeholder="What needs to be done today?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="h-12 flex-1 rounded-xl border-border/75 bg-background/80 text-base"
            disabled={addTodo.isPending}
          />
          <Button
            type="submit"
            className="h-12 rounded-xl px-5"
            disabled={!newTask.trim() || addTodo.isPending}
          >
            {addTodo.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Add task</span>
          </Button>
        </form>

        {totalCount > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Progress</span>
              <span className="text-foreground">{percent}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tasks completed"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-tone-amber transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Task List */}
      <section className="ambient-panel rounded-[1.7rem] p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Tasks</h2>
        {todos && todos.length > 0 ? (
          <ul className="stagger space-y-2.5">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={cn(
                  "group flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-300 sm:p-4",
                  todo.completed
                    ? "border-success/25 bg-success-muted/50"
                    : "border-border/60 bg-card/80 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-soft",
                )}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={todo.completed}
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? "not done" : "done"}`}
                  onClick={() => handleToggle(todo.id, todo.completed)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    todo.completed
                      ? "border-success bg-success text-success-foreground"
                      : "border-border hover:border-primary hover:bg-primary/5",
                  )}
                  disabled={toggleTodo.isPending}
                >
                  {todo.completed && <Check className="check-pop h-3.5 w-3.5 stroke-[3]" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm transition-colors duration-300",
                    todo.completed ? "text-muted-foreground line-through decoration-muted-foreground/60" : "font-medium text-foreground",
                  )}
                >
                  {todo.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete "${todo.title}"`}
                  className="h-8 w-8 text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => setTodoToDelete(todo.id)}
                  disabled={deleteTodo.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-2xl bg-primary/10 p-3.5 text-primary">
              <ListTodo className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">No tasks for today</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first task using the form above.
            </p>
          </div>
        )}
      </section>

      {/* Delete Todo Confirmation Dialog */}
      <AlertDialog
        open={todoToDelete !== null}
        onOpenChange={(open) => { if (!open) setTodoToDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This task will be permanently removed. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTodo.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTodo}
              disabled={deleteTodo.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTodo.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
