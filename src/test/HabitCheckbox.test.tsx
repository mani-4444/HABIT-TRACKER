import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HabitCheckbox } from "@/components/HabitCheckbox";
import { calculateHabitHealth } from "@/lib/health";

describe("HabitCheckbox Interactions", () => {
  const refDate = new Date("2026-08-27T12:00:00Z");

  const mockHealthDetail = calculateHabitHealth(
    "habit-test",
    ["2026-08-26", "2026-08-27"],
    "2026-08-25",
    refDate,
  );

  it("renders label, emoji, health badge, and streak", () => {
    render(
      <HabitCheckbox
        checked={false}
        onCheckedChange={() => {}}
        label="Read Books"
        emoji="📚"
        streak={5}
        healthDetail={mockHealthDetail}
      />,
    );

    expect(screen.getByText("Read Books")).toBeInTheDocument();
    expect(screen.getByText("📚")).toBeInTheDocument();
    expect(screen.getAllByText(/5 days/).length).toBeGreaterThan(0);
  });

  it("toggles completion when clicking checkbox button", () => {
    const handleToggle = vi.fn();
    render(
      <HabitCheckbox
        checked={false}
        onCheckedChange={handleToggle}
        label="Exercise"
        healthDetail={mockHealthDetail}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it("clicking health badge opens popover and does NOT toggle habit completion", () => {
    const handleToggle = vi.fn();
    render(
      <HabitCheckbox
        checked={false}
        onCheckedChange={handleToggle}
        label="DSA Practice"
        healthDetail={mockHealthDetail}
      />,
    );

    // Find the health badge button
    const badgeButton = screen.getByTitle("Click to view health status breakdown");
    expect(badgeButton).toBeInTheDocument();

    // Click the badge
    fireEvent.click(badgeButton);

    // Verify onCheckedChange was NOT called
    expect(handleToggle).not.toHaveBeenCalled();

    // Verify popover opened with details
    expect(screen.getByText(/History & Consistency:/i)).toBeInTheDocument();
    expect(screen.getByText(/Last completed:/i)).toBeInTheDocument();
  });

  it("supports keyboard activation for badge popover without toggling habit", () => {
    const handleToggle = vi.fn();
    render(
      <HabitCheckbox
        checked={false}
        onCheckedChange={handleToggle}
        label="Meditation"
        healthDetail={mockHealthDetail}
      />,
    );

    const badgeButton = screen.getByTitle("Click to view health status breakdown");
    badgeButton.focus();
    expect(badgeButton).toHaveFocus();

    // Press Enter on the badge
    fireEvent.keyDown(badgeButton, { key: "Enter", code: "Enter" });

    // The habit toggle should not have fired
    expect(handleToggle).not.toHaveBeenCalled();
  });
});
