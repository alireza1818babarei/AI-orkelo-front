import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./axios";
import { deleteSubTask, deleteWorkItem } from "./superTask";

vi.mock("./axios", () => ({
  default: {
    delete: vi.fn(),
  },
}));

describe("Super Task lifecycle API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.delete.mockResolvedValue({
      data: { message: "Deleted successfully.", data: [] },
    });
  });

  it("deletes a Sub-task through the hierarchy endpoint", async () => {
    await expect(deleteSubTask(10, 20, 30)).resolves.toEqual([]);

    expect(api.delete).toHaveBeenCalledWith(
      "/projects/10/tasks/20/sub-tasks/30",
    );
  });

  it("deletes a Work Item through the hierarchy endpoint", async () => {
    await expect(deleteWorkItem(10, 20, 30, 40)).resolves.toEqual([]);

    expect(api.delete).toHaveBeenCalledWith(
      "/projects/10/tasks/20/sub-tasks/30/work-items/40",
    );
  });
});
