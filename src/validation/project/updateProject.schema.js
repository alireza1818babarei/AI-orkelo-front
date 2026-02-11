import * as yup from "yup";

export const PROJECT_STATUS = ["active", "deactive"];

export const updateProjectSchema = yup.object({
  name: yup.string().nullable(),
  description: yup.string().nullable(),
  image: yup
    .mixed()
    .nullable()
    .test("is-file", "Image is not valid", (v) => {
      if (!v) return true;
      if (v instanceof File) return true;
      if (typeof FileList !== "undefined" && v instanceof FileList) {
        return v.length === 0 || v[0] instanceof File;
      }
      return false;
    })
    .test("fileType", "File format is not valid", (v) => {
      if (!v) return true;

      const file = v instanceof File ? v : v?.[0];
      if (!file) return true;

      return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    })
    .test("fileSize", "File size is bigger than excepted", (v) => {
      if (!v) return true;

      const file = v instanceof File ? v : v?.[0];
      if (!file) return true;

      return file.size <= 5 * 1024 * 1024;
    }),
  status: yup
    .string()
    .oneOf(PROJECT_STATUS, "Status is not valid")
    .required("Status is required"),
  description: yup.string().max(300).required("Description is required"),
});
