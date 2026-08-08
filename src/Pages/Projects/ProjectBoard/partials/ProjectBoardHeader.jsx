import { Button, Col, Row } from "reactstrap";
import { useEffect, useMemo, useState } from "react";
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
	{ value: "low", label: "Low", color: "#16a66a" },
	{ value: "medium", label: "Medium", color: "#0891a2" },
	{ value: "high", label: "High", color: "#f97316" },
	{ value: "urgent", label: "Urgent", color: "#dc3545" },
];

const normalizeText = (value) =>
	String(value ?? "")
		.trim()
		.toLowerCase();

const normalizeIdArray = (value) => {
	const source = Array.isArray(value) ? value : value == null ? [] : [value];
	const seen = new Set();

	return source
		.map((id) => Number(id))
		.filter((id) => Number.isInteger(id) && id > 0)
		.filter((id) => {
			if (seen.has(id)) return false;
			seen.add(id);
			return true;
		});
};

const normalizePriorityArray = (value) => {
	const source = Array.isArray(value) ? value : value == null ? [] : [value];
	const allowed = new Set(PRIORITY_OPTIONS.map((priority) => priority.value));
	const seen = new Set();

	return source
		.map(normalizeText)
		.filter((priority) => allowed.has(priority))
		.filter((priority) => {
			if (seen.has(priority)) return false;
			seen.add(priority);
			return true;
		});
};

const normalizeProjectTags = (tags) =>
	(Array.isArray(tags) ? tags : [])
		.map((tag, index) => {
			const id = Number(tag?.id);
			const name = String(tag?.name ?? "").trim();
			if (!Number.isInteger(id) || id <= 0 || !name) return null;
			if (tag?.is_active === false) return null;

			return {
				id,
				key: String(id),
				name,
				color: String(tag?.color ?? "").trim() || TAG_COLORS[index % TAG_COLORS.length],
			};
		})
		.filter(Boolean)
		.sort((a, b) => a.name.localeCompare(b.name));

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
	projectTags = [],
	tagsLoading = false,
	filters = {},
	onFiltersChange,
}) => {
	const title = [projectName, viewLabel].filter(Boolean).join(" / ");
	const filterDisabled = normalizeText(viewLabel) === "todo list";
	const availableTags = useMemo(
		() => normalizeProjectTags(projectTags),
		[projectTags],
	);
	const activeTagIds = useMemo(
		() => normalizeIdArray(filters?.tagIds ?? filters?.tag_ids),
		[filters],
	);
	const activePriorities = useMemo(
		() => normalizePriorityArray(filters?.priorities ?? filters?.priority),
		[filters],
	);
	const activeAssigneeIds = useMemo(
		() => normalizeIdArray(filters?.assigneeIds ?? filters?.assignee_ids),
		[filters],
	);
	const activeSearch = String(filters?.search ?? "").trim();
	const [filterOpen, setFilterOpen] = useState(false);
	const [draftTagIds, setDraftTagIds] = useState([]);
	const [draftPriorities, setDraftPriorities] = useState([]);
	const [draftSearch, setDraftSearch] = useState("");

	const hasActiveFilters = Boolean(
		activeTagIds.length ||
			activePriorities.length ||
			activeAssigneeIds.length ||
			activeSearch,
	);

	useEffect(() => {
		if (!filterOpen || typeof document === "undefined") return undefined;

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
	}, [filterOpen]);

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.$ !== "function") return;

		window.$(() => {
			window.$("Button").tooltip();
		});
	}, []);

	const filteredTags = useMemo(() => {
		const query = normalizeText(draftSearch);
		if (!query) return availableTags;
		return availableTags.filter((tag) =>
			normalizeText(tag.name).includes(query),
		);
	}, [availableTags, draftSearch]);

	const openFilterDrawer = () => {
		if (filterDisabled) return;
		setDraftTagIds(activeTagIds);
		setDraftPriorities(activePriorities);
		setDraftSearch(activeSearch);
		setFilterOpen(true);
	};

	const toggleDraftTag = (tagId) => {
		const normalizedTagId = Number(tagId);
		if (!Number.isInteger(normalizedTagId) || normalizedTagId <= 0) return;

		setDraftTagIds((current) =>
			current.includes(normalizedTagId)
				? current.filter((value) => value !== normalizedTagId)
				: [...current, normalizedTagId],
		);
	};

	const toggleDraftPriority = (priorityValue) => {
		setDraftPriorities((current) =>
			current.includes(priorityValue)
				? current.filter((value) => value !== priorityValue)
				: [...current, priorityValue],
		);
	};

	const handleApplyFilters = () => {
		onFiltersChange?.({
			tagIds: draftTagIds,
			priorities: draftPriorities,
			assigneeIds: activeAssigneeIds,
			search: draftSearch.trim(),
		});
		setFilterOpen(false);
	};

	const handleResetFilters = () => {
		setDraftTagIds([]);
		setDraftPriorities([]);
		setDraftSearch("");
		onFiltersChange?.({
			tagIds: [],
			priorities: [],
			assigneeIds: [],
			search: "",
		});
	};

	return (
		<>
			<Row className="project-board-header m-1 gx-2 align-items-center">
				<Col lg={5} xs={12} className="mt-1">
					<div className="project-board-header__meta">
						<h4 className="main-title mb-1 text-primary project-board-header__title" title={title}>
							{title}
						</h4>
					</div>
				</Col>

				<Col lg={7} xs={12} className="mt-1">
					<div className="project-board-header__actions-wrap">
						<div className="project-board-header__actions">
							<Button
								className="btn project-board-header__add-btn"
								onClick={onAddColumn}
								disabled={disableAddColumn}
								aria-label="Add column"
								title="Add column"
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
								data-orkelo-tour="project-task-filter"
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
						<h5 className="project-task-filter-drawer__title">Filter</h5>
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
					<section
						className="project-task-filter-section"
						aria-labelledby="task-priority-title"
					>
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
										<span>{priority.label}</span>
										{selected ? (
											<i
												className="ph ph-check project-task-filter-tag__check"
												aria-hidden="true"
											/>
										) : null}
									</button>
								);
							})}
						</div>
					</section>

					<section
						className="project-task-filter-section"
						aria-labelledby="project-tags-title"
					>
						<div className="project-task-filter-section__heading">
							<h6 id="project-tags-title">Project Tags</h6>
							{draftTagIds.length ? (
								<span>{draftTagIds.length} selected</span>
							) : null}
						</div>

						<div className="project-task-filter-tags">
							{filteredTags.map((tag) => {
								const selected = draftTagIds.includes(tag.id);

								return (
									<button
										type="button"
										key={tag.key}
										className={`project-task-filter-tag ${selected ? "is-selected" : ""}`}
										style={{ "--tag-color": tag.color }}
										onClick={() => toggleDraftTag(tag.id)}
										aria-pressed={selected}
									>
										<i className="ph ph-tag" aria-hidden="true" />
										<span>{tag.name}</span>
										{selected ? (
											<i
												className="ph ph-check project-task-filter-tag__check"
												aria-hidden="true"
											/>
										) : null}
									</button>
								);
							})}
						</div>

						{tagsLoading ? (
							<p className="project-task-filter-empty">Loading tags...</p>
						) : !availableTags.length ? (
							<p className="project-task-filter-empty">
								No project tags are available.
							</p>
						) : filteredTags.length === 0 ? (
							<p className="project-task-filter-empty">
								No tags match this search.
							</p>
						) : null}
					</section>
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
