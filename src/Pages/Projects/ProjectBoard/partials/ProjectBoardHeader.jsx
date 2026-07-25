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

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getTaskElements = () =>
  Array.from(document.querySelectorAll(".project-board-main .board-item-shell"));

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
  const [draftSearch, setDraftSearch] = useState("");
  const [draftHideUnmatched, setDraftHideUnmatched] = useState(true);
  const [activeTags, setActiveTags] = useState([]);
  const [activeSearch, setActiveSearch] = useState("");
  const [activeHideUnmatched, setActiveHideUnmatched] = useState(true);
  const [matchingTaskCount, setMatchingTaskCount] = useState(0);

  const hasActiveFilters = Boolean(activeTags.length || activeSearch.trim());

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

    setAvailableTags(nextTags);
  }, []);

  const applyFiltersToBoard = useCallback(() => {
    if (typeof document === "undefined") return;

    const normalizedSelectedTags = activeTags.map(normalizeText).filter(Boolean);
    const normalizedSearch = normalizeText(activeSearch);
    const taskElements = getTaskElements();
    let matches = 0;

    taskElements.forEach((taskElement) => {
      const taskTags = getTaskTagNames(taskElement).map(normalizeText);
      const matchesTags =
        normalizedSelectedTags.length === 0 ||
        normalizedSelectedTags.some((selectedTag) =>
          taskTags.includes(selectedTag),
        );
      const matchesSearch =
        !normalizedSearch ||
        getTaskSearchContent(taskElement).includes(normalizedSearch);
      const isMatch = matchesTags && matchesSearch;

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
  }, [activeHideUnmatched, activeSearch, activeTags, hasActiveFilters]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const boardRoot = document.querySelector(".project-board-main");
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
    $(function () {
      const tooltipInit = {
        init: function () {
          $("Button").tooltip();
        },
      };
      tooltipInit.init();
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

  const handleApplyFilters = () => {
    setActiveTags(draftTags);
    setActiveSearch(draftSearch.trim());
    setActiveHideUnmatched(draftHideUnmatched);
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setDraftTags([]);
    setDraftSearch("");
    setDraftHideUnmatched(true);
    setActiveTags([]);
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
                title={filterDisabled ? "Task filters are available in Task Manager" : "Filter tasks"}
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
              Filter by project tags
            </p>
          </div>
          <button
            type="button"
            className="project-task-filter-drawer__close"
            onClick={() => setFilterOpen(false)}
            aria-label="Close task filters"
          >
            <i className="ph ph-x" />
          </button>
        </div>

        <div className="project-task-filter-drawer__body">
          <label className="project-task-filter-search">
            <i className="ph ph-magnifying-glass" />
            <input
              type="search"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Search tags or tasks"
              aria-label="Search tags or tasks"
            />
          </label>

          <h6 className="project-task-filter-section-title">Project Tags</h6>
          {filteredTags.length ? (
            <div className="project-task-filter-tags">
              {filteredTags.map((tag) => {
                const selected = draftTags.some(
                  (selectedTag) =>
                    normalizeText(selectedTag) === normalizeText(tag.name),
                );

                return (
                  <button
                    key={tag.key}
                    type="button"
                    className={`project-task-filter-tag ${
                      selected ? "is-selected" : ""
                    }`}
                    style={{ "--tag-color": tag.color }}
                    onClick={() => toggleDraftTag(tag.name)}
                    aria-pressed={selected}
                  >
                    <i className="ph ph-tag" />
                    <span>{tag.name}</span>
                    {selected ? (
                      <span className="project-task-filter-tag__check">
                        <i className="ph ph-check" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="project-task-filter-empty">
              No project tags match this search.
            </div>
          )}

          <div className="project-task-filter-summary" aria-live="polite">
            <i className="ph ph-check-square-offset" />
            <span>{matchingTaskCount} matching tasks</span>
          </div>

          <div className="project-task-filter-toggle-row">
            <span>Show only matching tasks</span>
            <button
              type="button"
              className={`project-task-filter-toggle ${
                draftHideUnmatched ? "is-on" : ""
              }`}
              onClick={() => setDraftHideUnmatched((current) => !current)}
              aria-pressed={draftHideUnmatched}
              aria-label="Show only matching tasks"
            />
          </div>
        </div>

        <div className="project-task-filter-drawer__footer">
          <button
            type="button"
            className="project-task-filter-action project-task-filter-action--reset"
            onClick={handleResetFilters}
          >
            Reset
          </button>
          <button
            type="button"
            className="project-task-filter-action project-task-filter-action--apply"
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
