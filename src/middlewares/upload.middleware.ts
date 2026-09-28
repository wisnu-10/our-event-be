import multer from 'multer';
import { MAX_UPLOAD_MB } from '../config/main.config';

const storage = multer.memoryStorage();

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error('Format file harus JPG, PNG, atau WEBP'));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

export function uploadSingle(field: string) {
  return upload.single(field);
}
