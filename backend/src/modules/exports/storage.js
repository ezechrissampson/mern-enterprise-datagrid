import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where generated export files are persisted so they can be re-downloaded
 * later from Export History. This is a simple local-disk implementation —
 * swap `ensureExportsDir`/`resolveStoredPath` for an S3/GCS-backed
 * implementation in production (same two functions, same call sites).
 */
export const EXPORTS_DIR = process.env.EXPORT_STORAGE_DIR
  ? path.resolve(process.env.EXPORT_STORAGE_DIR)
  : path.resolve(__dirname, '../../../storage/exports');

export function ensureExportsDir() {
  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  return EXPORTS_DIR;
}

export function buildStoredFilename(extension) {
  return `${Date.now()}-${uuid()}.${extension}`;
}

export function resolveStoredPath(storedFilename) {
  const resolved = path.join(EXPORTS_DIR, storedFilename);
  // Defense in depth: never allow a stored filename to escape the exports dir.
  if (!resolved.startsWith(EXPORTS_DIR)) {
    throw new Error('Invalid stored filename');
  }
  return resolved;
}

export function deleteStoredFile(storedFilename) {
  const filePath = resolveStoredPath(storedFilename);
  return fs.promises.unlink(filePath).catch(() => {});
}

export default { EXPORTS_DIR, ensureExportsDir, buildStoredFilename, resolveStoredPath, deleteStoredFile };
