import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import projectColumnsReducer, {
  getColumnTasksThunk,
  getProjectColumnsThunk,
} from "./projectColumnsSlice";
import projectTodoListReducer, {
  getTodoListColumnTasksThunk,
  getTodoListColumnsThunk,
} from "./projectTodoListSlice";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const createProjectColumnsStore = () =>
  configureStore({
    reducer: { projectColumns: projectColumnsReducer },
  });

const createTodoListStore = () =>
  configureStore({
    reducer: { projectTodoList: projectTodoListReducer },
  });

describe("project board state isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears old columns immediately and ignores a stale project response", async () => {
    const project14Response = createDeferred();
    const project19Response = createDeferred();
    api.get.mockImplementation((url) => {
      if (url === "/projects/14/columns") return project14Response.promise;
      if (url === "/projects/19/columns") return project19Response.promise;
      throw new Error(`Unexpected request: ${url}`);
    });

    const store = createProjectColumnsStore();
    const project14Request = store.dispatch(getProjectColumnsThunk(14));

    expect(store.getState().projectColumns.projectId).toBe(14);

    const project19Request = store.dispatch(getProjectColumnsThunk(19));

    expect(store.getState().projectColumns).toMatchObject({
      projectId: 19,
      items: [],
      status: "loading",
    });

    project14Response.resolve({
      data: { data: [{ id: 104, project_id: 14, title: "Old" }] },
    });
    await project14Request;

    expect(store.getState().projectColumns).toMatchObject({
      projectId: 19,
      items: [],
      status: "loading",
    });

    project19Response.resolve({
      data: { data: [{ id: 204, project_id: 19, title: "Current" }] },
    });
    await project19Request;

    expect(store.getState().projectColumns).toMatchObject({
      projectId: 19,
      items: [{ id: 204, project_id: 19, title: "Current" }],
      status: "succeeded",
    });
  });

  it("blocks forced task requests for columns outside the active project", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: 104, project_id: 14, title: "Wrong project" },
          { id: 204, project_id: 19, title: "Current project" },
        ],
      },
    });

    const store = createProjectColumnsStore();
    await store.dispatch(getProjectColumnsThunk(19));

    expect(store.getState().projectColumns.items.map((column) => column.id)).toEqual([
      204,
    ]);

    api.get.mockClear();
    const action = await store.dispatch(
      getColumnTasksThunk({ projectId: 19, columnId: 104, force: true }),
    );

    expect(action.meta.condition).toBe(true);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("ignores a task response that finishes after the project changes", async () => {
    const oldTasksResponse = createDeferred();
    const project19Response = createDeferred();
    api.get.mockImplementation((url) => {
      if (url === "/projects/14/columns") {
        return Promise.resolve({
          data: { data: [{ id: 104, project_id: 14, title: "Old" }] },
        });
      }
      if (url === "/projects/14/columns/104/tasks") return oldTasksResponse.promise;
      if (url === "/projects/19/columns") return project19Response.promise;
      throw new Error(`Unexpected request: ${url}`);
    });

    const store = createProjectColumnsStore();
    await store.dispatch(getProjectColumnsThunk(14));
    const oldTaskRequest = store.dispatch(
      getColumnTasksThunk({ projectId: 14, columnId: 104, force: true }),
    );
    const project19Request = store.dispatch(getProjectColumnsThunk(19));

    oldTasksResponse.resolve({
      data: { data: [{ id: 500, text: "Stale task" }] },
    });
    await oldTaskRequest;

    expect(store.getState().projectColumns).toMatchObject({
      projectId: 19,
      items: [],
      status: "loading",
    });

    project19Response.resolve({
      data: { data: [{ id: 204, project_id: 19, title: "Current" }] },
    });
    await project19Request;

    expect(store.getState().projectColumns.items[0].tasks).toBeUndefined();
  });

  it("applies the same column membership guard to todo-list task requests", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [{ id: 304, project_id: 19, board_type: "todo_list" }],
      },
    });

    const store = createTodoListStore();
    await store.dispatch(getTodoListColumnsThunk({ projectId: 19 }));

    api.get.mockClear();
    const action = await store.dispatch(
      getTodoListColumnTasksThunk({
        projectId: 19,
        columnId: 104,
        force: true,
      }),
    );

    expect(action.meta.condition).toBe(true);
    expect(api.get).not.toHaveBeenCalled();
  });
});
