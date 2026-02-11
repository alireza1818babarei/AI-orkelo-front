import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import api from "../../api/axios";
import { toastError } from "../../utils/sweetAlert";

const TaskDetailModal = ({ isOpen, onClose, task, projectId }) => {
  const t = task || {};
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [checklistText, setChecklistText] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const taskId = useMemo(
    () => t?.id ?? t?.task_id ?? t?.uuid ?? null,
    [t?.id, t?.task_id, t?.uuid],
  );

  useEffect(() => {
    if (!isOpen || !taskId) return;
    const initial =
      t?.checklist_items ??
      t?.checklists ??
      t?.checklist ??
      [];
    setChecklistItems(Array.isArray(initial) ? initial : []);
  }, [isOpen, taskId]);

  const submitChecklistItem = async () => {
    const text = checklistText.trim();
    if (!text) {
      setShowChecklistInput(false);
      return;
    }
    if (!projectId || !taskId) {
      toastError("Project or task id missing");
      return;
    }
    try {
      setChecklistLoading(true);
      const res = await api.post(
        `/projects/${projectId}/tasks/${taskId}/checklist-items`,
        { text },
      );
      const item = res.data?.data ?? res.data ?? { text };
      setChecklistItems((prev) => [...prev, item]);
      setChecklistText("");
      setShowChecklistInput(false);
    } catch (err) {
      toastError("Create checklist failed");
    } finally {
      setChecklistLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <div className="d-flex justify-content-between p-4 border border-bottom-1 rounded-top">
        <div className="d-flex align-items-end gap-2">
          <button className="btn btn-outline-primary ">
            <i className="ti ti-check me-1"></i>
            Complete Task
          </button>
          <button type="button" className="btn text-muted">
            <i className="ti ti-user-plus me-1 fs-4"></i>
            Assign
          </button>
        </div>
        <div className="ms-auto d-flex gap-2">
          <button type="button" className="btn text-muted icon-btn b-r-100">
            <i className="ti ti-pin fs-4"></i>
          </button>
          <button type="button" className="btn text-muted icon-btn b-r-100">
            <i className="ti ti-dots fs-4"></i>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="btn text-muted icon-btn b-r-100"
          >
            <i className="fa-solid fa-times fa-fw fs-5"></i>
          </button>
        </div>
      </div>

      <ModalBody className="pt-2 pb-lg-5">
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className=" pb-3">
              <input
                type="text"
                className="form-control f-s-16 border-0 mb-3"
                placeholder="Task title"
                defaultValue={t.text || t.title || ""}
              />
              <textarea
                className="form-control f-s-14 border-0"
                rows="1"
                placeholder="Click to add a description"
                defaultValue={t.description || ""}
              />
            </div>

            <div className="py-3">
                <button
                  type="button"
                  className="btn px-2 b-r-20 d-flex align-items-center gap-2 text-info"
                  onClick={() => setShowChecklistInput(true)}
                >
                  <i class="fa-solid fa-plus fa-fw"></i>
                  <span>Add checklist item</span>
                </button>
                {showChecklistInput ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Write an item..."
                      value={checklistText}
                      onChange={(e) => setChecklistText(e.target.value)}
                      onBlur={submitChecklistItem}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitChecklistItem();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setShowChecklistInput(false);
                          setChecklistText("");
                        }
                      }}
                      autoFocus
                      disabled={checklistLoading}
                    />
                  </div>
                ) : null}
                {checklistItems.length ? (
                  <div className="mt-2 d-flex flex-column gap-2">
                    {checklistItems.map((item, idx) => (
                      <div
                        key={item.id ?? item.uuid ?? `${item.text}-${idx}`}
                        className="d-flex align-items-center gap-2"
                      >
                        <input type="checkbox" className="form-check-input mt-0" />
                        <span className="small">
                          {item.text ?? item.title ?? item.name ?? "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
            </div>

            <div>
              <button
                type="button"
                className="btn px-2 b-r-20 d-flex align-items-center gap-2 text-info"
              >
                <i class="fa-solid fa-plus fa-fw"></i>
                <span>Add attachment</span>
              </button>
            </div>

            <div className="pt-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fs-6">Activity</span>
              </div>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Click to add a comment"
              ></textarea>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-light-info small mt-2 align-self-start px-1 b-r-10">
                  @to mention someone
                </small>
                <button type="button" className="btn btn-info m-2 px-2 py-0 b-r-5">
                  <i className="ti ti-arrow-right fs-5"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="bg-info-700 rounded-3 p-3 h-100">
              <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                <button type="button" className="btn border text-white icon-btn b-r-100">
                  <i className="ti ti-player-play fs-5"></i>
                </button>
                <div className="vr"></div>
                <span className="fw-semibold">00:00:00</span>
              </div>
              <div className="d-flex flex-column gap-3 mt-3">
                <button
                  type="button"
                  className="btn d-flex align-items-center justify-content-between px-0 text-white"
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="ti ti-calendar fs-5"></i>
                    Due date
                  </span>
                  <i className="ti ti-chevron-down"></i>
                </button>
                <button
                  type="button"
                  className="btn d-flex align-items-center justify-content-between px-0 text-white"
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="ti ti-tag fs-5"></i>
                    Tags
                  </span>
                  <i className="ti ti-chevron-down"></i>
                </button>
                <button
                  type="button"
                  className="btn d-flex align-items-center justify-content-between px-0 text-white"
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="ti ti-link fs-5"></i>
                    Relations
                  </span>
                  <i className="ti ti-chevron-down"></i>
                </button>
                <button
                  type="button"
                  className="btn d-flex align-items-center justify-content-between px-0 text-white"
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="ti ti-eye fs-5"></i>
                    Watching
                  </span>
                  <i className="ti ti-chevron-down"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TaskDetailModal;
