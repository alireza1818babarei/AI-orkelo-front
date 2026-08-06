import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import TelegramHeaderButton from "./TelegramHeaderButton";

describe("TelegramHeaderButton", () => {
  it("navigates to the Telegram integration page in the current tab", () => {
    render(
      <MemoryRouter>
        <ul>
          <TelegramHeaderButton />
        </ul>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", {
      name: "Open Telegram integration",
    });

    expect(link).toHaveAttribute("href", "/profile/integrations");
    expect(link).not.toHaveAttribute("target");
  });
});
