import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteWorkItem,
  getEntityTimeline,
  getSubTask,
  getWorkItem,
} from "../../../api/superTask";
import { alertConfirm } from "../../../utils/sweetAlert";
import SuperTaskItemModal from "./SuperTaskItemModal";

vi.mock("../../../api/superTask", () => ({
  createWorkItem: vi.fn(),
  deleteWorkItem: vi.fn(),
  getEntityTimeline: vi.fn(),
  getSubTask: vi.fn(),
  getWorkItem: vi.fn(),
  updateSubTask: vi.fn(),
  updateWorkItem: vi.fn(),
}));

vi.mock("../../../utils/sweetAlert", () => ({
  alertConfirm: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("reactstrap", () => ({
  Modal: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
  ModalBody: ({ children }) => <div>{children}</div>,
  Spinner: () => <span>Loading</span>,
}));

vi.mock("../../../Components/taskDetailModal/TaskActivityConversation", () => ({
  default: () => <div>Activity</div>,
}));
vi.mock("../../../Components/taskDetailModal/TaskAttachments", () => ({
  default: () => <div>Attachments</div>,
}));
vi.mock("./SuperTaskCreateWorkItemForm", () => ({ default: () => null }));
vi.mock("./SuperTaskInlineTextField", () => ({
  default: ({ value }) => <span>{value}</span>,
}));
vi.mock("./SuperTaskReviewControls", () => ({ default: () => null }));
vi.mock("./SuperTaskUserDropdown", () => ({ default: () => null }));
vi.mock("./SuperTaskWorkItemDetail", () => ({
  default: ({ workItem }) => <div>{`Detail ${workItem.title}`}</div>,
}));

const timeline = { activities: [], comments: [] };
const workItem = {
  id: 40,
  title: "Create API",
  review_status: "in_progress",
  capabilities: { can_delete: true },
};
const subTaskWithWorkItem = {
  id: 30,
  title: "Backend",
  description: "",
  review_status: "in_progress",
  capabilities: { can_edit: true },
  work_items: [workItem],
};

describe("Work Item delete transition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    getEntityTimeline.mockResolvedValue(timeline);
    getSubTask
      .mockResolvedValueOnce(subTaskWithWorkItem)
      .mockResolvedValue({ ...subTaskWithWorkItem, work_items: [] });
    alertConfirm.mockResolvedValue({ isConfirmed: true });
    deleteWorkItem.mockResolvedValue([]);
  });

  it("deletes from the card, refreshes its parent, and never opens the deleted detail", async () => {
    const onChanged = vi.fn().mockResolvedValue(undefined);
    const onWorkItemChange = vi.fn();

    render(
      <SuperTaskItemModal
        isOpen
        projectId={10}
        taskId={20}
        subTaskId={30}
        onChanged={onChanged}
        onWorkItemChange={onWorkItemChange}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: "More actions for Create API",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteWorkItem).toHaveBeenCalledWith(10, 20, 30, 40);
    });
    await waitFor(() => {
      expect(screen.queryByText("Create API")).not.toBeInTheDocument();
    });

    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(onWorkItemChange).not.toHaveBeenCalled();
    expect(getWorkItem).not.toHaveBeenCalled();
    expect(
      getEntityTimeline.mock.calls.some(([path]) =>
        String(path).includes("/work-items/40"),
      ),
    ).toBe(false);
  });
});
