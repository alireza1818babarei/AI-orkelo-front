import React from "react";
import "./superTaskDarkFix.css";
import "./superTaskSummaryGrid.css";

function SummaryCard({ icon, title, total, subTaskCount, workItemCount, tone = "primary" }) {
  const isTotal = subTaskCount == null && workItemCount == null;

  return (
    <article className={`super-task-summary-card is-${tone}`}>
      <span className="super-task-summary-card__icon">
        <i className={icon} aria-hidden="true" />
      </span>
      <div className="super-task-summary-card__content">
        <span>{title}</span>
        {isTotal ? (
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            {total || 0}
          </span>
        ) : (
          <div className="super-task-summary-card__split">
            <span>Sub-tasks <strong>{subTaskCount || 0}</strong></span>
            <span>Work-items <strong>{workItemCount || 0}</strong></span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function SuperTaskSummaryGrid({ summary }) {
  const stats = [
    { title: "Sub-tasks", total: summary?.sub_tasks?.total, icon: "ti ti-subtask", tone: "primary" },
    { title: "Work-items", total: summary?.work_items?.total, icon: "ti ti-list-check", tone: "violet" },
    { title: "Approved", subTaskCount: summary?.sub_tasks?.approved, workItemCount: summary?.work_items?.approved, icon: "ti ti-circle-check", tone: "success" },
    { title: "In Progress", subTaskCount: summary?.sub_tasks?.in_progress, workItemCount: summary?.work_items?.in_progress, icon: "ti ti-clock", tone: "info" },
    { title: "Pending Review", subTaskCount: summary?.sub_tasks?.pending_review, workItemCount: summary?.work_items?.pending_review, icon: "ti ti-hourglass", tone: "warning" },
    { title: "Rejected", subTaskCount: summary?.sub_tasks?.rejected, workItemCount: summary?.work_items?.rejected, icon: "ti ti-circle-x", tone: "danger" },
  ];

  return (
    <section className="super-task-summary-grid">
      {stats.map((stat) => <SummaryCard key={stat.title} {...stat} />)}
    </section>
  );
}
