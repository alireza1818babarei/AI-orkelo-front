import React, { useEffect, useMemo, useRef, useState } from "react";
import { getTextDirectionProps } from "../../../utils/textDirection";

const AUTO_GROW_STYLE = {
  height: "auto",
  overflow: "hidden",
  resize: "none",
};

const resizeTextarea = (element) => {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

export default function SuperTaskInlineTextField({
  value = "",
  onCommit,
  canEdit = false,
  saving = false,
  kind = "description",
  placeholder = "",
  className = "",
}) {
  const textareaRef = useRef(null);
  const normalizedValue = String(value ?? "");
  const [draft, setDraft] = useState(normalizedValue);
  const [savedValue, setSavedValue] = useState(normalizedValue);
  const isTitle = kind === "title";

  useEffect(() => {
    setSavedValue(normalizedValue);
    setDraft((current) =>
      document.activeElement === textareaRef.current ? current : normalizedValue,
    );
  }, [normalizedValue]);

  useEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [draft]);

  const directionProps = useMemo(
    () => getTextDirectionProps(draft, AUTO_GROW_STYLE),
    [draft],
  );

  const commit = async () => {
    if (!canEdit || saving) return;

    const nextValue = draft.trim();
    if (isTitle && !nextValue) {
      setDraft(savedValue);
      return;
    }

    if (nextValue.trim() === savedValue.trim()) {
      if (isTitle) setDraft(nextValue);
      return;
    }

    try {
      const saved = await onCommit?.(nextValue);
      if (saved === false) {
        setDraft(savedValue);
        return;
      }

      setSavedValue(nextValue);
      setDraft(nextValue);
    } catch {
      // The caller owns error messaging; restoring the last server value avoids stale UI.
      setDraft(savedValue);
    }
  };

  return (
    <div
      className={`task-detail-editor task-detail-editor--${kind} super-task-inline-editor ${
        canEdit ? "" : "is-readonly"
      } ${className}`.trim()}
    >
      <textarea
        ref={textareaRef}
        className={`form-control border-0 ${
          isTitle ? "task-title-textarea" : "autogrow-textarea"
        }`}
        rows="1"
        value={draft}
        placeholder={placeholder}
        readOnly={!canEdit || saving}
        aria-busy={saving}
        aria-label={isTitle ? "Title" : "Description"}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (isTitle && event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        onInput={(event) => resizeTextarea(event.currentTarget)}
        {...directionProps}
      />
    </div>
  );
}
