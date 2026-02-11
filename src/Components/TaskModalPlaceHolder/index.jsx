import React from "react";

const TaskModalPlaceHolder = () => {
  return (
    <div className="row g-4">
      <div className="col-12 col-lg-8">
        <div className="border-bottom pb-3">
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
          </div>
          <div className="placeholder-glow mt-2">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-10"></span>
          </div>
        </div>
        <div className="py-3">
          <div className="placeholder-glow">
            <span className="placeholder col-4"></span>
          </div>
          <div className="placeholder-glow mt-2">
            <span className="placeholder col-8"></span>
          </div>
        </div>
        <div className="py-3">
          <div className="placeholder-glow">
            <span className="placeholder col-3"></span>
          </div>
        </div>
        <div className="pt-3">
          <div className="placeholder-glow mb-2">
            <span className="placeholder col-3"></span>
          </div>
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-11"></span>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="bg-light rounded-3 p-3 h-100">
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
          </div>
          <div className="placeholder-glow mt-3">
            <span className="placeholder col-8"></span>
            <span className="placeholder col-7"></span>
            <span className="placeholder col-9"></span>
            <span className="placeholder col-6"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModalPlaceHolder;
