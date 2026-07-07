import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

const ProjectColumnModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errors,
  titleField,
  titleRef,
  colorField,
  colorRef,
  iconField,
  iconRef,
  iconValue,
  onPickIcon,
  isEdit,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState("phosphor"); // "phosphor" | "tabler" | "fontawesome"
  const [q, setQ] = useState("");
  const [lists, setLists] = useState({
    phosphor: null,
    tabler: null,
    fontawesome: null,
  });

  const normalizedQuery = String(q || "").trim().toLowerCase();

  const previewIconClass = useMemo(() => {
    const raw = String(iconValue ?? "").trim();
    if (!raw) return "";
    if (raw.includes("ph-") || raw.includes("fa-") || raw.includes("ti ")) return raw;
    if (raw.startsWith("ti-")) return `ti ${raw}`;
    if (/^[a-z0-9-]+$/i.test(raw)) return `ti ti-${raw}`;
    return raw;
  }, [iconValue]);

  const takeFirst = (arr, n = 220) => (Array.isArray(arr) ? arr.slice(0, n) : []);

  useEffect(() => {
    if (!pickerOpen) return;

    let cancelled = false;
    const load = async () => {
      try {
        if (pickerTab === "tabler") {
          if (Array.isArray(lists.tabler)) return;
          const mod = await import("../../../../Data/Icons/TablerIconsList");
          const next = Array.isArray(mod?.TablerIconsList) ? mod.TablerIconsList : [];
          if (cancelled) return;
          setLists((prev) => ({ ...(prev || {}), tabler: next }));
          return;
        }

        if (pickerTab === "fontawesome") {
          if (Array.isArray(lists.fontawesome)) return;
          const mod = await import("../../../../Data/Icons");
          const next = Array.isArray(mod?.fontAwesomeIcons) ? mod.fontAwesomeIcons : [];
          if (cancelled) return;
          setLists((prev) => ({ ...(prev || {}), fontawesome: next }));
          return;
        }

        // phosphor (default)
        if (Array.isArray(lists.phosphor)) return;
        const mod = await import("../../../../Data/Icons/phosphor");
        const next = Array.isArray(mod?.PhosphorIcons) ? mod.PhosphorIcons : [];
        if (cancelled) return;
        setLists((prev) => ({ ...(prev || {}), phosphor: next }));
      } catch {
        // ignore
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [pickerOpen, pickerTab, lists.fontawesome, lists.phosphor, lists.tabler]);

  const filtered = useMemo(() => {
    const limit = 220;

    if (pickerTab === "tabler") {
      const list = lists.tabler || [];
      if (!normalizedQuery) return takeFirst(list, limit);
      return list
        .filter((it) => {
          const name = String(it?.name ?? "").toLowerCase();
          const code = String(it?.code ?? "").toLowerCase();
          return name.includes(normalizedQuery) || code.includes(normalizedQuery);
        })
        .slice(0, limit);
    }

    if (pickerTab === "fontawesome") {
      const list = lists.fontawesome || [];
      if (!normalizedQuery) return takeFirst(list, limit);
      return list
        .filter((it) => {
          const name = String(it?.name ?? "").toLowerCase();
          const icon = String(it?.icon ?? "").toLowerCase();
          return name.includes(normalizedQuery) || icon.includes(normalizedQuery);
        })
        .slice(0, limit);
    }

    // phosphor (default)
    const list = lists.phosphor || [];
    if (!normalizedQuery) return takeFirst(list, limit);
    return list
      .filter((it) => {
        const code = String(it?.iconCode ?? "").toLowerCase();
        const cls = String(it?.className ?? "").toLowerCase();
        return code.includes(normalizedQuery) || cls.includes(normalizedQuery);
      })
      .slice(0, limit);
  }, [pickerTab, normalizedQuery]);

  const pick = (value) => {
    if (typeof onPickIcon === "function") onPickIcon(value);
    setPickerOpen(false);
    setQ("");
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>
        {isEdit ? "Edit Column" : "Add Column"}
      </ModalHeader>

      <Form className="app-form" onSubmit={onSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="column-title">Title</Label>
            <Input
              id="column-title"
              type="text"
              {...titleField}
              innerRef={titleRef}
              invalid={!!errors.title}
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup>
            <Label for="column-color">Color</Label>
            <Input
              id="column-color"
              type="color"
              {...colorField}
              innerRef={colorRef}
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup>
            <Label for="column-icon">Icon</Label>
            <div className="d-flex align-items-center gap-2">
              <div
                className="border rounded-3 bg-light d-flex align-items-center justify-content-center"
                style={{ width: 56, height: 46, flex: "0 0 56px" }}
                title={previewIconClass || ""}
              >
                {previewIconClass ? (
                  <i className={previewIconClass} style={{ fontSize: 24 }} />
                ) : (
                  <span className="text-muted small">—</span>
                )}
              </div>
              <Input
                id="column-icon"
                type="text"
                placeholder="e.g. ph-duotone ph-gear  |  ti ti-list  |  fa-solid fa-star"
                {...iconField}
                innerRef={iconRef}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                color="primary"
                outline
                disabled={isSubmitting}
                onClick={() => setPickerOpen(true)}
              >
                Choose
              </Button>
            </div>
            <div className="text-muted small mt-1">
              Pick an icon class and we send the full className to backend.
            </div>
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button
            className="project-board-modal-cancel-btn"
            color="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button color="primary" type="submit" disabled={isSubmitting}>
            {isEdit ? "Update Column" : "Create Column"}
          </Button>
        </ModalFooter>
      </Form>

      <Modal
        isOpen={pickerOpen}
        toggle={() => setPickerOpen(false)}
        centered
        size="lg"
        scrollable
      >
        <ModalHeader toggle={() => setPickerOpen(false)}>
          Choose Icon
        </ModalHeader>
        <ModalBody>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Button
              type="button"
              color={pickerTab === "phosphor" ? "primary" : "secondary"}
              outline={pickerTab !== "phosphor"}
              size="sm"
              onClick={() => setPickerTab("phosphor")}
            >
              Phosphor
            </Button>
            <Button
              type="button"
              color={pickerTab === "tabler" ? "primary" : "secondary"}
              outline={pickerTab !== "tabler"}
              size="sm"
              onClick={() => setPickerTab("tabler")}
            >
              Tabler (ti)
            </Button>
            <Button
              type="button"
              color={pickerTab === "fontawesome" ? "primary" : "secondary"}
              outline={pickerTab !== "fontawesome"}
              size="sm"
              onClick={() => setPickerTab("fontawesome")}
            >
              FontAwesome
            </Button>
          </div>

          <Input
            type="text"
            placeholder="Search icons..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="text-muted small mt-1">
            Showing up to 220 results. Use search to narrow.
          </div>

          <div
            className="mt-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
              gap: 10,
            }}
          >
            {filtered.map((it, idx) => {
              const key =
                it?.code ?? it?.className ?? it?.icon ?? `${pickerTab}-${idx}`;
              const label =
                it?.name ?? it?.iconCode ?? it?.code ?? it?.className ?? it?.icon ?? "icon";
              const cls =
                pickerTab === "tabler"
                  ? String(it?.code ?? "")
                  : pickerTab === "fontawesome"
                    ? String(it?.icon ?? "")
                    : String(it?.className ?? "");
              const isSelected = cls === previewIconClass;

              return (
                <button
                  key={key}
                  type="button"
                  className="btn border d-flex align-items-center justify-content-center"
                  onClick={() => pick(cls)}
                  style={{
                    minHeight: 88,
                    padding: 12,
                    background: isSelected ? "rgba(var(--primary), 0.12)" : "var(--white)",
                    borderColor: isSelected ? "rgba(var(--primary), 0.45)" : "",
                  }}
                  title={label}
                  aria-label={label}
                >
                  <i
                    className={cls}
                    style={{ fontSize: 30, lineHeight: 1 }}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            className="project-board-modal-cancel-btn"
            type="button"
            color="secondary"
            onClick={() => setPickerOpen(false)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Modal>
  );
};

export default ProjectColumnModal;
