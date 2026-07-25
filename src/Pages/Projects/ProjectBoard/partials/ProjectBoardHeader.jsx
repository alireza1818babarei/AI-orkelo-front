import { Button, Col, Row } from "reactstrap";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../projectTaskFilter.css";

const TAG_COLORS = [
  "#3884ff",
  "#19b879",
  "#8957e5",
  "#f59e0b",
  "#f04464",
  "#11a7b8",
  "#ef5bd8",
  "#64748b",
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "#16a66a", icon: "ph-arrow-down" },
  { value: "medium", label: "Medium", color: "#0891a2", icon: "ph-equals" },
  { value: "high", label: "High", color: "#f97316", icon: "ph-arrow-up" },
  { value: "urgent", label: "Urgent", color: "#dc3545", icon: "ph-warning" },
];

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getTaskElements = () =>
  Array.from(
    document.querySelectorAll(
      ".project-board-main__content .board-item-shell",
    ),
  );

const getTaskSearchContent = (taskElement) => {
  const title = taskElement.querySelector(".board-item-title")?.textContent ?? "";
  const description = taskElement.querySelector(".board-item-desc")?.textContent ?? "";
  const tags = Array.from(
    taskElement.querySelectorAll(".board-item-tags-row .badge"),
  ).map((tag) => tag.textContent ?? "");

  return normalizeText([title, description, ...tags].join(" "));
};

const getTaskTagNames = (taskElement) =>
  Array.from(taskElement.querySelectorAll(".board-item-tags-row .badge"))
    .map((tag) => String(tag.textContent ?? "").trim())
    .filter(Boolean);

const getTaskPriority = (taskElement) => {
  const priorityDataElement = taskElement.hasAttribute("data-task-priority")
    ? taskElement
    : taskElement.querySelector("[data-task-priority]");
  const explicitPriority = normalizeText(
    priorityDataElement?.getAttribute("data-task-priority"),
  );

  if (PRIORITY_OPTIONS.some((priority) => priority.value === explicitPriority)) {
    return explicitPriority;
  }

  const priorityCue = taskElement.querySelector(".board-item-priority-cue");
  if (!priorityCue) return "";

  const className = String(priorityCue.className ?? "");
  const priorityFromClass = PRIORITY_OPTIONS.find(
    (priority) =>
      className.includes(`board-item-priority-cue--${priority.value}`),
  );

  if (priorityFromClass) return priorityFromClass.value;

  const accessibleLabel = normalizeText(
    priorityCue.getAttribute("aria-label") ||
      priorityCue.getAttribute("title") ||
      priorityCue.textContent,
  );

  return (
    PRIORITY_OPTIONS.find(
      (priority) =>
        accessibleLabel.includes(priority.value),
    )?.value ?? ""
  );
};

const ProjectBoardHeader = ({
  projectName,
  viewLabel,
  onAddColumn,
  onDelete,
  onEdit,
  onInfo,
  disableAddColumn,
  disableDelete,
  disableEdit,
  disableInfo,
  showDelete = true,
}) => {
  const title = [projectName, viewLabel].filter(Boolean).join(" / ");
  const filterDisabled = normalizeText(viewLabel) === "todo list";
  const [filterOpen, setFilterOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [draftTags, setDraftTags] = useState([]);
  const [draftPriorities, setDraftPriorities] = useState([]);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftHideUnmatched, setDraftHideUnmatched] = useState(true);
  const [activeTags, setActiveTags] = useState([]);
  const [activePriorities, setActivePriorities] = useState([]);
  const [activeSearch, setActiveSearch] = useState("");
  const [activeHideUnmatched, setActiveHideUnmatched] = useState(true);
  const [matchingTaskCount, setMatchingTaskCount] = useState(0);

  const hasActiveFilters = Boolean(
    activeTags.length || activePriorities.length || activeSearch.trim(),
  );

  const scanBoardTags = useCallback(() => {
    if (typeof document === "undefined") return;

    const tagMap = new Map();
    getTaskElements().forEach((taskElement) => {
      getTaskTagNames(taskElement).forEach((tagName) => {
        const key = normalizeText(tagName);
        if (!key || tagMap.has(key)) return;
        tagMap.set(key, tagName);
      });
    });

    const nextTags = Array.from(tagMap.entries())
      .map(([key, name], index) => ({
        key,
        name,
        color: TAG_COLORS[index % TAG_COLORS.length],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setAvailableTags((currentTags) => {
      const currentKey = currentTags
        .map((tag) => `${tag.key}:${tag.name}:${tag.color}`)
        .join("|");
      const nextKey = nextTags
        .map((tag) => `${tag.key}:${tag.name}:${tag.color}`)
        .join("|");
      return currentKey === nextKey ? currentTags : nextTags;
    });
  }, []);

  const applyFiltersToBoard = useCallback(() => {
    if (typeof document === "undefined") return;

    const normalizedSelectedTags = activeTags.map(normalizeText).filter(Boolean);
    const normalizedSelectedPriorities = activePriorities
      .map(normalizeText)
      .filter(Boolean);
    const normalizedSearch = normalizeText(activeSearch);
    const taskElements = getTaskElements();
    let matches = 0;

    taskElements.forEach((taskElement) => {
      const taskTags = getTaskTagNames(taskElement).map(normalizeText);
      const taskPriority = getTaskPriority(taskElement);
      const matchesTags =
        normalizedSelectedTags.length === 0 ||
        normalizedSelectedTags.some((selectedTag) =>
          taskTags.includes(selectedTag),
        );
      const matchesPriority =
        normalizedSelectedPriorities.length === 0 ||
        normalizedSelectedPriorities.includes(taskPriority);
      const matchesSearch =
        !normalizedSearch ||
        getTaskSearchContent(taskElement).includes(normalizedSearch);
      const isMatch = matchesTags && matchesPriority && matchesSearch;

      if (isMatch) matches += 1;

      taskElement.classList.toggle(
        "task-filter-hidden",
        hasActiveFilters && activeHideUnmatched && !isMatch,
      );
      taskElement.classList.toggle(
        "task-filter-dimmed",
        hasActiveFilters && !activeHideUnmatched && !isMatch,
      );
    });

    setMatchingTaskCount(hasActiveFilters ? matches : taskElements.length);
  }, [
    activeHideUnmatched,
    activePriorities,
    activeSearch,
    activeTags,
    hasActiveFilters,
  ]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const boardRoot = document.querySelector(".project-board-main__content");
    scanBoardTags();
    applyFiltersToBoard();

    if (!boardRoot || typeof MutationObserver === "undefined") return undefined;

    let animationFrame = null;
    const observer = new MutationObserver(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        scanBoardTags();
        applyFiltersToBoard();
      });
    });

    observer.observe(boardRoot, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [applyFiltersToBoard, scanBoardTags]);

  useEffect(() => {
    if (!filterOpen || typeof document === "undefined") return undefined;

    scanBoardTags();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [filterOpen, scanBoardTags]);

  useEffect(
    () => () => {
      if (typeof document === "undefined") return;
      getTaskElements().forEach((taskElement) => {
        taskElement.classList.remove("task-filter-hidden", "task-filter-dimmed");
      });
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.$ !== "function") return;

    window.$(() => {
      window.$("Button").tooltip();
    });
  }, []);

  const filteredTags = useMemo(() => {
    const query = normalizeText(draftSearch);
    if (!query) return availableTags;
    return availableTags.filter((tag) => normalizeText(tag.name).includes(query));
  }, [availableTags, draftSearch]);

  const openFilterDrawer = () => {
    if (filterDisabled) return;
    setDraftTags(activeTags);
    setDraftPriorities(activePriorities);
    setDraftSearch(activeSearch);
    setDraftHideUnmatched(activeHideUnmatched);
    scanBoardTags();
    setFilterOpen(true);
  };

  const toggleDraftTag = (tagName) => {
    setDraftTags((current) => {
      const exists = current.some(
        (selectedTag) => normalizeText(selectedTag) === normalizeText(tagName),
      );
      return exists
        ? current.filter(
            (selectedTag) => normalizeText(selectedTag) !== normalizeText(tagName),
          )
        : [...current, tagName];
    });
  };

  const toggleDraftPriority = (priorityValue) => {
    setDraftPriorities((current) =>
      current.includes(priorityValue)
        ? current.filter((value) => value !== priorityValue)
        : [...current, priorityValue],
    );
  };

  const handleApplyFilters = () => {
    setActiveTags(draftTags);
    setActivePriorities(draftPriorities);
    setActiveSearch(draftSearch.trim());
    setActiveHideUnmatched(draftHideUnmatched);
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setDraftTags([]);
    setDraftPriorities([]);
    setDraftSearch("");
    setDraftHideUnmatched(true);
    setActiveTags([]);
    setActivePriorities([]);
    setActiveSearch("");
    setActiveHideUnmatched(true);
  };

  return (
    <>
      <Row className="project-board-header m-1 gx-2 align-items-center">
        <Col lg={7} md={6} xs={12} className="mt-1">
          <div className="project-board-header__meta">
            <h4 className="main-title mb-1 text-primary">{title}</h4>
          </div>
        </Col>

        <Col lg={5} md={6} xs={12} className="mt-1">
          <div className="project-board-header__actions-wrap">
            <div className="project-board-header__actions">
              <Button
                className="btn project-board-header__add-btn"
                onClick={onAddColumn}
                disabled={disableAddColumn}
              >
                <i className="ph ph-plus-circle" />
                <span>Add Column</span>
              </Button>
              <Button
                className="btn project-board-header__icon-btn"
                onClick={onEdit}
                disabled={disableEdit}
                aria-label="Project edit"
                title="Edit project"
              >
                <i className="ph ph-pencil-line" />
              </Button>
              <Button
                className="btn project-board-header__icon-btn"
                aria-label="Project archives"
                title="Project archives"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas-archived-tasks"
                aria-controls="offcanvas-archived-tasks"
              >
                <i className="ph ph-archive" />
              </Button>
              <Button
                className="btn project-board-header__icon-btn"
                aria-label="Deleted tasks"
                title="Deleted tasks"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas-deleted-tasks"
                aria-controls="offcanvas-deleted-tasks"
              >
                <i className="iconoir-bin-half" />
              </Button>
              <Button
                className={`btn project-board-header__icon-btn ${
                  hasActiveFilters ? "filter-active" : ""
                }`}
                onClick={openFilterDrawer}
                disabled={filterDisabled}
                aria-label="Filter tasks"
                title={
                  filterDisabled
                    ? "Task filters are available in Task Manager"
                    : "Filter tasks"
                }
                aria-expanded={filterOpen}
                aria-controls="project-task-filter-drawer"
              >
                <i className="ph ph-funnel" />
              </Button>
              <Button
                className="btn project-board-header__icon-btn"
                onClick={onInfo}
                disabled={disableInfo}
                aria-label="Project information"
                title="Project information"
              >
                <i className="ph ph-info" />
              </Button>
              {showDelete ? (
                <Button
                  className="btn project-board-header__icon-btn danger"
                  onClick={onDelete}
                  disabled={disableDelete}
                  aria-label="Project delete"
                  title="Delete project"
                >
                  <i className="ph ph-trash-simple" />
                </Button>
              ) : null}
            </div>
          </div>
        </Col>
      </Row>

      <button
        type="button"
        className={`project-task-filter-backdrop ${filterOpen ? "is-open" : ""}`}
        onClick={() => setFilterOpen(false)}
        aria-label="Close task filters"
        tabIndex={filterOpen ? 0 : -1}
      />

      <aside
        id="project-task-filter-drawer"
        className={`project-task-filter-drawer ${filterOpen ? "is-open" : ""}`}
        aria-hidden={!filterOpen}
        aria-label="Filter tasks"
      >
        <div className="project-task-filter-drawer__header">
          <div>
            <h5 className="project-task-filter-drawer__title">Filter Tasks</h5>
            <p className="project-task-filter-drawer__subtitle">
              Filter by project tags and priority
            </p>
          </div>
          <button
            type="button"
            className="project-task-filter-drawer__close"
            onClick={() => setFilterOpen(false)}
            aria-label="Close filter drawer"
          >
            <i className="ph ph-x" />
          </button>
        </div>

        <div className="project-task-filter-drawer__body app-scroll">
          <label className="project-task-filter-search">
            <i className="ph ph-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Search tags or tasks"
              aria-label="Search tags or tasks"
            />
          </label>

          <section className="project-task-filter-section" aria-labelledby="project-tags-title">
            <div className="project-task-filter-section__heading">
              <h6 id="project-tags-title">Project Tags</h6>
              {draftTags.length ? <span>{draftTags.length} selected</span> : null}
            </div>

            <div className="project-task-filter-tags">
              {filteredTags.map((tag) => {
                const selected = draftTags.some(
                  (selectedTag) => normalizeText(selectedTag) === tag.key,
                );

                return (
                  <button
                    type="button"
                    key={tag.key}
                    className={`project-task-filter-tag ${selected ? "is-selected" : ""}`}
                    style={{ "--tag-color": tag.color }}
                    onClick={() => toggleDraftTag(tag.name)}
                    aria-pressed={selected}
                  >
                    <i className="ph ph-tag" aria-hidden="true" />
                    <span>{tag.name}</span>
                    {selected ? (
                      <i className="ph ph-check project-task-filter-tag__check" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {!availableTags.length ? (
              <p className="project-task-filter-empty">No task tags are available.</p>
            ) : filteredTags.length === 0 ? (
              <p className="project-task-filter-empty">No tags match this search.</p>
            ) : null}
          </section>

          <section className="project-task-filter-section" aria-labelledby="task-priority-title">
            <div className="project-task-filter-section__heading">
              <h6 id="task-priority-title">Priority</h6>
              {draftPriorities.length ? (
                <span>{draftPriorities.length} selected</span>
              ) : null}
            </div>

            <div className="project-task-filter-tags project-task-filter-priorities">
              {PRIORITY_OPTIONS.map((priority) => {
                const selected = draftPriorities.includes(priority.value);

                return (
                  <button
                    type="button"
                    key={priority.value}
                    className={`project-task-filter-tag project-task-filter-priority ${
                      selected ? "is-selected" : ""
                    }`}
                    style={{ "--tag-color": priority.color }}
                    onClick={() => toggleDraftPriority(priority.value)}
                    aria-pressed={selected}
                  >
                    <i className={`ph ${priority.icon}`} aria-hidden="true" />
                    <span>{priority.label}</span>
                    {selected ? (
                      <i className="ph ph-check project-task-filter-tag__check" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="project-task-filter-summary" aria-live="polite">
            <span className="project-task-filter-summary__icon">
              <i className="ph ph-check-square-offset" aria-hidden="true" />
            </span>
            <span>
              <strong>{matchingTaskCount}</strong> matching task
              {matchingTaskCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="project-task-filter-option">
            <span>Show only matching tasks</span>
            <button
              type="button"
              className={`project-task-filter-switch ${
                draftHideUnmatched ? "is-on" : ""
              }`}
              role="switch"
              aria-checked={draftHideUnmatched}
              onClick={() => setDraftHideUnmatched((current) => !current)}
            >
              <span className="visually-hidden">
                {draftHideUnmatched ? "Disable" : "Enable"} show only matching tasks
              </span>
            </button>
          </div>
        </div>

        <div className="project-task-filter-drawer__footer">
          <button
            type="button"
            className="project-task-filter-reset"
            onClick={handleResetFilters}
          >
            Reset
          </button>
          <button
            type="button"
            className="project-task-filter-apply"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProjectBoardHeader;
