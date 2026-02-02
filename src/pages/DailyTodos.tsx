import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useDailyTodos,
  useAddDailyTodo,
  useToggleDailyTodo,
  useDeleteDailyTodo,
  getTodayDateString,
} from "@/hooks/useDailyTodos";

export default function DailyTodos() {
  const [newTask, setNewTask] = useState("");
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

  const handleDelete = (id: string) => {
    deleteTodo.mutate({ id, task_date: today });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-center text-destructive">
            Failed to load todos: {error?.message || "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = todos?.filter((t) => t.completed).length || 0;
  const totalCount = todos?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Today</h1>
        <p className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `${completedCount} of ${totalCount} tasks completed`
            : "Plan your day with a simple to-do list"}
        </p>
      </div>

      {/* Add Task Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add a Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              type="text"
              placeholder="What needs to be done today?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1"
              disabled={addTodo.isPending}
            />
            <Button
              type="submit"
              disabled={!newTask.trim() || addTodo.isPending}
            >
              {addTodo.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">Add</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {todos && todos.length > 0 ? (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    todo.completed
                      ? "border-muted bg-muted/50"
                      : "border-border bg-background hover:bg-accent/50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    disabled={toggleTodo.isPending}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      todo.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {todo.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(todo.id)}
                    disabled={deleteTodo.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-sm font-medium text-foreground">
                No tasks for today
              </h3>
              <p className="text-sm text-muted-foreground">
                Add your first task using the form above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
