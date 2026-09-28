import cloudinary from '../config/cloudinary.config';
import { isCloudinaryConfigured } from '../config/main.config';
import AppError from './app-error.helper';

export function assertCloudinaryConfigured(): void {
  if (!isCloudinaryConfigured) {
    throw AppError(
      'Cloudinary belum dikonfigurasi. Isi CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET di backend/.env',
      503,
    );
  }
}

export async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  assertCloudinaryConfigured();
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, res) => {
      if (err || !res) return reject(err ?? new Error('Upload gagal'));
      resolve({ secure_url: res.secure_url });
    });
    stream.end(buffer);
  });
  return result.secure_url;
}
