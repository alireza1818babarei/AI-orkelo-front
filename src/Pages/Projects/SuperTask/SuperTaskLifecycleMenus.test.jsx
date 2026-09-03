import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SuperTaskSubTaskRow from "./SuperTaskSubTaskRow";
import SuperTaskWorkItemCard from "./SuperTaskWorkItemCard";

const setMatchMedia = () => {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

describe("Super Task row lifecycle menus", () => {
  beforeEach(() => {
    setMatchMedia();
  });

  it("shows Sub-task Delete only when can_delete is explicitly true", () => {
    const onDelete = vi.fn();
    const onOpen = vi.fn();
    const baseItem = {
      id: 30,
      title: "Backend",
      review_status: "in_progress",
      work_role_stages: [],
    };
    const { rerender } = render(
      <SuperTaskSubTaskRow
        item={{ ...baseItem, capabilities: { can_delete: false } }}
        onDelete={onDelete}
        onOpen={onOpen}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "More actions for Backend" }),
    ).not.toBeInTheDocument();

    rerender(
      <SuperTaskSubTaskRow
        item={{ ...baseItem, capabilities: { can_delete: true } }}
        onDelete={onDelete}
        onOpen={onOpen}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "More actions for Backend" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 30, title: "Backend" }),
    );
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("keeps the Work Item card closed when its Delete action is selected", () => {
    const onDelete = vi.fn();
    const onOpen = vi.fn();
    const item = {
      id: 40,
      title: "Create API",
      review_status: "in_progress",
      capabilities: { can_delete: true },
    };

    const { rerender } = render(
      <SuperTaskWorkItemCard
        item={{ ...item, capabilities: { can_delete: false } }}
        onDelete={onDelete}
        onOpen={onOpen}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: "More actions for Create API",
      }),
    ).not.toBeInTheDocument();

    rerender(
      <SuperTaskWorkItemCard
        item={item}
        onDelete={onDelete}
        onOpen={onOpen}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "More actions for Create API" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith(item);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
