import * as Yup from 'yup';
import {
  allowedExtensions,
  allowedMimeTypes,
} from './reportFileFormats';

export const dailyReportSchema = Yup.object({
  // The backend accepts description as nullable text, so the upload form can submit it optionally.
  description: Yup.string().nullable(),
  file: Yup.mixed()
    .required('File is required')
    .test(
      'fileFormat',
      'Only supported report file types are allowed.',
      (value) => {
        if (!value) return false;

        const mimeTypeValid = allowedMimeTypes.includes(value.type);

        const fileName = value.name || '';
        const extension = fileName.split('.').pop()?.toLowerCase();
        const extensionValid = allowedExtensions.includes(extension);

        return mimeTypeValid || extensionValid;
      },
    )
    .test('fileSize', 'File size must be 300MB or less.', (value) => {
      if (!value?.size) return true;
      return value.size <= 307200 * 1024;
    }),
});
