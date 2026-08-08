import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import TaskAttachments, {
  isAudioAttachment,
  isVoiceAttachment,
} from "./TaskAttachments";
import ChecklistItemAttachments from "./ChecklistItemAttachments";

const { dispatchMock } = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
}));

vi.mock("../../api/axios", () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const telegramVoice = {
  id: 101,
  original_name: "attachment-without-audio-extension.bin",
  download_url: "https://cdn.example.test/task/telegram-voice.oga",
  is_voice: true,
  mime_type: "audio/ogg",
  duration: 37,
  size: 2048,
};

const websiteVoice = {
  id: 102,
  original_name: "voice-recording-123-12000ms.webm",
  download_url: "https://cdn.example.test/task/website-voice.webm",
  mime: "audio/webm",
  size: 1024,
};

const normalFile = {
  id: 103,
  original_name: "report.pdf",
  download_url: "https://cdn.example.test/task/report.pdf",
  is_voice: false,
  mime_type: "application/pdf",
  size: 4096,
};

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "load", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("voice attachment detection", () => {
  it("prioritizes the backend is_voice flag without relying on a filename", () => {
    expect(isVoiceAttachment(telegramVoice)).toBe(true);
    expect(isAudioAttachment(telegramVoice)).toBe(true);
  });

  it("keeps website recordings and normal files classified as before", () => {
    expect(isVoiceAttachment(websiteVoice)).toBe(true);
    expect(isVoiceAttachment(normalFile)).toBe(false);
    expect(
      isVoiceAttachment({
        original_name: "meeting.ogg",
        is_voice: false,
        mime_type: "audio/ogg",
      }),
    ).toBe(false);
  });
});

describe("Telegram voice rendering", () => {
  it("uses the existing voice player in the Task attachment path", async () => {
    const { container } = render(
      <TaskAttachments
        projectId={1}
        taskId={2}
        columnId={3}
        prefetched
        initialAttachments={[telegramVoice, websiteVoice, normalFile]}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".task-voice-card")).toHaveLength(2);
    });

    const players = container.querySelectorAll(".task-voice-player");
    expect(players).toHaveLength(2);
    expect(players[0].querySelector("audio")).toHaveAttribute(
      "src",
      telegramVoice.download_url,
    );
    expect(players[0].querySelector('input[type="range"]')).toHaveAttribute(
      "max",
      "37",
    );
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(container.querySelectorAll(".row.g-2 > div")).toHaveLength(1);
  });

  it("uses the same existing voice player in the Checklist Item path", () => {
    const { container } = render(
      <ChecklistItemAttachments
        projectId={1}
        taskId={2}
        checklistItem={{
          id: 4,
          attachments: [telegramVoice, normalFile],
        }}
        showTrigger={false}
      />,
    );

    const player = container.querySelector(".task-voice-player");
    expect(player).toBeInTheDocument();
    expect(player.querySelector("audio")).toHaveAttribute(
      "src",
      telegramVoice.download_url,
    );
    expect(player.querySelector('input[type="range"]')).toHaveAttribute(
      "max",
      "37",
    );
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(
      container.querySelectorAll(".checklist-item-attachment-card"),
    ).toHaveLength(1);
  });
});
