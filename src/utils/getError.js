export const getErrorMessage = (err)=> {
  if (err?.errors) return err;
  return { message: err?.message || "Unknown Error" }
}

