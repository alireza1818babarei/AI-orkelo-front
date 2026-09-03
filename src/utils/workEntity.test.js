import { describe, expect, it } from "vitest";
import { resolveNotificationTarget } from "./notificationNavigation";
import {
  buildWorkEntityPath,
  getWorkEntityKey,
  getWorkEntityPresentation,
} from "./workEntity";

describe("work entity navigation", () => {
  it("keeps the existing normal Task route and Todo List intent", () => {
    expect(
      buildWorkEntityPath({
        entity_type: "task",
        project_id: 12,
        task_id: 34,
        task_board_type: "todo_list",
      }),
    ).toBe("/projects/12/task/34?view=todo-list");
  });

  it("builds a deep link for the full Work Item hierarchy", () => {
    const entity = {
      entity_type: "work_item",
      project_id: 2,
      super_task_id: 39,
      sub_task_id: 51,
      work_item_id: 77,
    };

    expect(buildWorkEntityPath(entity)).toBe(
      "/projects/2/tasks/39?subTask=51&workItem=77",
    );
    expect(getWorkEntityKey(entity)).toBe("work_item:77");
  });

  it("uses Work Item notification properties before the root Task relation", () => {
    expect(
      resolveNotificationTarget({
        type: "super_task_item.activity",
        project: { id: 2 },
        task: { id: 39 },
        properties: {
          entity_type: "work_item",
          project_id: 2,
          super_task_id: 39,
          sub_task_id: 51,
          work_item_id: 77,
        },
      }),
    ).toEqual({
      path: "/projects/2/tasks/39?subTask=51&workItem=77",
      label: "Open Work Item",
    });
  });

  it("keeps normal Task notification navigation unchanged", () => {
    expect(
      resolveNotificationTarget({
        project: { id: 12 },
        task: {
          id: 34,
          column: { board_type: "todo_list" },
        },
        properties: {},
      }),
    ).toEqual({
      path: "/projects/12/task/34?view=todo-list",
      label: "Open task",
    });
  });

  it("exposes compact Work Item and Work Role presentation", () => {
    expect(
      getWorkEntityPresentation({
        entity_type: "work_item",
        work_item_title: "Prepare layout",
        super_task_title: "AI Interview",
        sub_task_title: "Update design",
        assigned_user: {
          name: "Sara Rahimi",
          work_role: { name: "Designer" },
        },
      }),
    ).toMatchObject({
      isWorkItem: true,
      label: "Work Item",
      title: "Prepare layout",
      context: "AI Interview / Update design",
      workRole: { name: "Designer" },
    });
  });
});
