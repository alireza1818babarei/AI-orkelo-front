import React, { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActionDropdown from ".";

vi.mock("./TaskMoveModal", () => ({
  default: ({ isOpen }) => (isOpen ? <div>Move task modal</div> : null),
}));

function NormalTaskMenu({ onCopy }) {
  const rootRef = useRef(null);

  return (
    <div ref={rootRef}>
      <ActionDropdown
        open
        onToggle={() => {}}
        rootRef={rootRef}
        actions={[
          { key: "copyLink", label: "Copy link", onClick: onCopy },
          { key: "archive", label: "Archive", onClick: () => {} },
          { key: "delete", label: "Delete", onClick: () => {} },
        ]}
      />
    </div>
  );
}

describe("normal Task action menu regression", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it("keeps Copy, Move, Archive, and Delete in their existing order", () => {
    const onCopy = vi.fn();
    render(<NormalTaskMenu onCopy={onCopy} />);

    expect(
      screen.getAllByRole("button").map((button) => button.textContent.trim()),
    ).toEqual([
      "Copy link",
      "Move to another project",
      "Archive",
      "Delete",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
