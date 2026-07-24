import { Directory, File, Paths } from "expo-file-system";

const docscanDir = new Directory(Paths.document, "docscan");

async function ensureDirectory(): Promise<void> {
  if (!docscanDir.exists) {
    docscanDir.create({ intermediates: true });
  }
}

export async function saveImage(
  sourceUri: string,
  documentId: number,
  pageNumber: number
): Promise<string> {
  await ensureDirectory();

  const filename = `doc${documentId}_page${pageNumber}_${Date.now()}.jpg`;
  const destination = new File(docscanDir, filename);

  const source = new File(sourceUri);

  source.copy(destination);

  return destination.uri;
}

export async function deleteFile(uri: string): Promise<void> {
  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
}

export async function getStorageSize(): Promise<number> {
  await ensureDirectory();

  let total = 0;

  for (const item of docscanDir.list()) {
    if (item instanceof File) {
      total += item.size ?? 0;
    }
  }

  return total;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}