import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import TaskActivityConversation from "./TaskActivityConversation";

const store = configureStore({
  reducer: {
    auth: () => ({ user: { id: 1, name: "Alireza" } }),
  },
});

describe("Super Task deletion activity", () => {
  it("renders deleted Sub-task and Work Item titles with danger styling", () => {
    render(
      <Provider store={store}>
        <TaskActivityConversation
          projectId={10}
          taskId={20}
          activities={[
            {
              id: 1,
              action: "sub_task.deleted",
              user_name: "Alireza",
              created_at: "2026-09-04T08:00:00Z",
              properties: { sub_task_title: "Backend" },
            },
            {
              id: 2,
              action: "work_item.deleted",
              user_name: "Alireza",
              created_at: "2026-09-04T08:01:00Z",
              properties: { work_item_title: "Create API" },
            },
          ]}
          comments={[]}
        />
      </Provider>,
    );

    const subTaskMessage = screen.getByText('deleted Sub-task "Backend"');
    const workItemMessage = screen.getByText('deleted Work Item "Create API"');

    expect(subTaskMessage).toHaveClass("text-danger");
    expect(workItemMessage).toHaveClass("text-danger");
    expect(document.querySelectorAll(".ti-trash")).toHaveLength(2);
    expect(document.querySelectorAll(".bg-light-danger.b-1-danger")).toHaveLength(2);
  });
});
