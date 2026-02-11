import React from "react";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function TaskChecklist({
  title = "Checklist",
  value = [],
  onChange,
}) {
  const items = value;

  const [isAdding, setIsAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const draftRef = React.useRef(null);

  const commit = (next) => onChange?.(next);

  const startAdd = () => {
    setIsAdding(true);
    setDraft("");
    requestAnimationFrame(() => draftRef.current?.focus());
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setDraft("");
  };

  const submitDraft = () => {
    const text = draft.trim();
    if (!text) {
      cancelAdd();
      return;
    }
    commit([...items, { id: uid(), text, done: false }]);
    cancelAdd();
  };

  const toggle = (id) => {
    commit(items.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const updateText = (id, text) => {
    commit(items.map((x) => (x.id === id ? { ...x, text } : x)));
  };

  const remove = (id) => {
    commit(items.filter((x) => x.id !== id));
  };

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold">{title}</div>

        {!isAdding ? (
          <button type="button" className="btn btn-sm btn-light" onClick={startAdd}>
            + Add item
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-sm btn-primary" onClick={submitDraft}>
              Add
            </button>
            <button type="button" className="btn btn-sm btn-light" onClick={cancelAdd}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* draft input */}
      {isAdding ? (
        <div className="p-2 rounded mb-2" style={{ background: "rgba(0,0,0,0.03)" }}>
          <textarea
            ref={draftRef}
            className="form-control f-s-12"
            rows={2}
            placeholder="Write an item..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitDraft();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelAdd();
              }
            }}
            onBlur={() => {
              submitDraft();
            }}
            style={{ resize: "vertical" }}
          />
          <div className="text-muted small mt-1">
            Enter = Add ، Shift+Enter = New line، Esc = Cancel
          </div>
        </div>
      ) : null}

      {/* items */}
      {items.length === 0 ? (
        <div className="text-muted small">No items yet.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="d-flex align-items-start gap-2 p-2 rounded"
              style={{ background: "rgba(0,0,0,0.03)" }}
            >
              <input
                className="form-check-input mt-1"
                type="checkbox"
                checked={!!it.done}
                onChange={() => toggle(it.id)}
              />

              <textarea
                className="form-control"
                rows={1}
                value={it.text}
                onChange={(e) => updateText(it.id, e.target.value)}
                style={{
                  resize: "none",
                  textDecoration: it.done ? "line-through" : "none",
                  opacity: it.done ? 0.7 : 1,
                }}
              />

              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => remove(it.id)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// FIXME add tooltip
