import React, { useMemo, useState } from "react";
import { Spinner } from "reactstrap";
import { getTextDirectionProps } from "../../../utils/textDirection";
import SuperTaskUserDropdown from "./SuperTaskUserDropdown";

export default function SuperTaskCreateWorkItemForm({
  projectMembers = [],
  creating = false,
  onCreate,
  onCancel,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const titleDirectionProps = useMemo(
    () => getTextDirectionProps(title),
    [title],
  );
  const descriptionDirectionProps = useMemo(
    () => getTextDirectionProps(description),
    [description],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const numericAssigneeId = Number(assignedUserId);

    // Work Item creation intentionally stays limited to the backend-required fields.
    if (!trimmedTitle) {
      setValidationMessage("Work Item title is required.");
      return;
    }
    if (!assignedUserId || !Number.isInteger(numericAssigneeId)) {
      setValidationMessage("Choose an assigned project member.");
      return;
    }

    setValidationMessage("");
    const created = await onCreate?.({
      title: trimmedTitle,
      description: description.trim() || null,
      assigned_user_id: numericAssigneeId,
    });

    if (created !== false) {
      setTitle("");
      setDescription("");
      setAssignedUserId("");
    }
  };

  return (
    <form className="super-task-create-work-item" onSubmit={handleSubmit}>
      <div className="super-task-create-work-item__fields">
        <input
          className="form-control"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (validationMessage) setValidationMessage("");
          }}
          placeholder="Work Item title"
          disabled={creating}
          autoFocus
          {...titleDirectionProps}
        />
        <textarea
          className="form-control"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows="2"
          disabled={creating}
          {...descriptionDirectionProps}
        />
      </div>

      <div className="super-task-create-work-item__footer">
        <div>
          <SuperTaskUserDropdown
            users={projectMembers}
            selectedUserId={assignedUserId}
            onChange={(userId) => {
              setAssignedUserId(userId ?? "");
              if (validationMessage) setValidationMessage("");
            }}
            allowUnassigned={false}
            emptyLabel="Select assignee"
            disabled={creating}
          />
          {validationMessage ? (
            <div className="super-task-create-work-item__validation" role="alert">
              {validationMessage}
            </div>
          ) : null}
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={onCancel}
            disabled={creating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm text-white"
            disabled={creating || !title.trim() || !assignedUserId}
          >
            {creating ? <Spinner size="sm" className="me-2" /> : null}
            Create Work Item
          </button>
        </div>
      </div>
    </form>
  );
}
