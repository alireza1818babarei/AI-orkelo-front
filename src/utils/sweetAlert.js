import Swal from "sweetalert2";

// Base for normal dialogs (modal)
const baseDialog = {
  confirmButtonText: "OK",
  cancelButtonText: "Cancel",
  heightAuto: false,
};

// Base for toasts
const baseToast = {
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timerProgressBar: true,
  heightAuto: false,
  customClass: {
    container: "swal-toast-container",
    popup: "swal-toast-popup",
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
};

export const alertSuccess = (title = "Success", text = "") =>
  Swal.fire({
    ...baseDialog,
    icon: "success",
    title,
    text,
  });

export const alertError = (title = "Error", text = "Something went wrong") =>
  Swal.fire({
    ...baseDialog,
    icon: "error",
    title,
    text,
  });

export const alertInfo = (title = "Info", text = "") =>
  Swal.fire({
    ...baseDialog,
    icon: "info",
    title,
    text,
  });

export const alertConfirm = ({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "Cancel",
} = {}) =>
  Swal.fire({
    ...baseDialog,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

// Toasts
export const toastSuccess = (title = "Done", timer = 2500) =>
  Swal.fire({
    ...baseToast,
    icon: "success",
    title,
    timer,
  });

export const toastError = (title = "Error", timer = 3000) =>
  Swal.fire({
    ...baseToast,
    icon: "error",
    title,
    timer,
  });

export const toastInfo = (title = "Info", timer = 2500) =>
  Swal.fire({
    ...baseToast,
    icon: "info",
    title,
    timer,
  });
