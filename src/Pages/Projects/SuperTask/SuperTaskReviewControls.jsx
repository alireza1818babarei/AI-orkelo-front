import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import { alertTextConfirm, toastError, toastSuccess } from "../../../utils/sweetAlert";
import { reviewSuperTaskEntity } from "../../../api/superTask";
import { getReviewMeta, REVIEW_STATUS } from "./superTask.utils";

export default function SuperTaskReviewControls({
  entity,
  projectId,
  taskId,
  subTaskId = null,
  workItemId = null,
  onChanged,
  compact = false,
  showStatus = true,
  secondaryActionsInMenu = false,
}) {
  const [busyAction, setBusyAction] = useState("");
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);
  const capabilities = entity?.capabilities ?? {};
  const status = String(entity?.review_status || REVIEW_STATUS.IN_PROGRESS);
  const meta = getReviewMeta(status);

  const runAction = async (action) => {
    let rejectionReason = "";

    if (action === "reject") {
      const result = await alertTextConfirm({
        title: "Reject item",
        text: "Explain what needs to be changed before this item can be approved.",
        confirmText: "Reject",
        cancelText: "Cancel",
        inputLabel: "Rejection reason",
        inputPlaceholder: "Required changes...",
        requiredMessage: "Rejection reason is required.",
      });
      if (!result?.isConfirmed) return;
      rejectionReason = String(result.value || "").trim();
      if (!rejectionReason) return;
    }

    try {
      setBusyAction(action);
      const next = await reviewSuperTaskEntity({
        projectId,
        taskId,
        subTaskId,
        workItemId,
        action,
        rejectionReason,
      });
      toastSuccess(
        action === "submit"
          ? "Submitted for review"
          : action === "approve"
            ? "Item approved"
            : action === "reject"
              ? "Changes requested"
              : "Item restored to in progress",
      );
      await onChanged?.(next);
    } catch (error) {
      toastError(error?.message || "Review action failed");
    } finally {
      setBusyAction("");
    }
  };

  const actionButton = (action, label, icon, className) => (
    <button
      type="button"
      className={`btn ${className} ${compact ? "btn-sm" : ""}`}
      onClick={() => runAction(action)}
      disabled={Boolean(busyAction)}
    >
      {busyAction === action ? (
        <Spinner size="sm" className="me-2" />
      ) : (
        <i className={`${icon} me-2`} aria-hidden="true" />
      )}
      {label}
    </button>
  );

  return (
    <div className="super-task-review-controls">
      {showStatus ? (
        <span className={`super-task-status is-${meta.tone}`}>
          <i className={meta.icon} aria-hidden="true" />
          {meta.label}
        </span>
      ) : null}

      {capabilities.can_submit
        ? actionButton(
            "submit",
            "Submit for review",
            "ti ti-send",
            "btn-primary text-white",
          )
        : null}

      {capabilities.can_approve
        ? actionButton(
            "approve",
            "Approve",
            "ti ti-check",
            "btn-success text-white",
          )
        : null}

      {capabilities.can_reject
        ? actionButton(
            "reject",
            "Request changes",
            "ti ti-x",
            "btn-outline-danger",
          )
        : null}

      {capabilities.can_restore && !secondaryActionsInMenu
        ? actionButton(
            "restore",
            "Restore",
            "ti ti-rotate-clockwise",
            "btn-outline-primary",
          )
        : null}

      {capabilities.can_restore && secondaryActionsInMenu ? (
        <Dropdown
          isOpen={secondaryMenuOpen}
          toggle={() => setSecondaryMenuOpen((current) => !current)}
          className="super-task-review-controls__secondary"
        >
          <DropdownToggle
            tag="button"
            type="button"
            className={`btn btn-light ${compact ? "btn-sm" : ""} super-task-review-controls__menu-toggle`}
            disabled={Boolean(busyAction)}
            aria-label="More review actions"
            title="More review actions"
          >
            <i className="ti ti-dots-vertical" aria-hidden="true" />
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem
              onClick={() => runAction("restore")}
              disabled={Boolean(busyAction)}
            >
              {busyAction === "restore" ? (
                <Spinner size="sm" className="me-2" />
              ) : (
                <i className="ti ti-rotate-clockwise me-2" aria-hidden="true" />
              )}
              Restore
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : null}
    </div>
  );
}
