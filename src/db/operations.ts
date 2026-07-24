import { getDb } from "./client";
import type { Document, DocumentWithPages, Page } from "./schema";

export async function createDocument(name: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO documents (name) VALUES (?)",
    [name]
  );
  return result.lastInsertRowId;
}

export async function addPage(
  documentId: number,
  pageNumber: number,
  imageUri: string
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO pages (document_id, page_number, image_uri) VALUES (?, ?, ?)",
    [documentId, pageNumber, imageUri]
  );
  await db.runAsync(
    "UPDATE documents SET updated_at = datetime('now') WHERE id = ?",
    [documentId]
  );
  return result.lastInsertRowId;
}

export async function getDocuments(): Promise<Document[]> {
  const db = await getDb();
  return db.getAllAsync<Document>(
    "SELECT * FROM documents ORDER BY created_at DESC"
  );
}

export async function getDocument(id: number): Promise<DocumentWithPages | null> {
  const db = await getDb();
  const doc = await db.getFirstAsync<Document>(
    "SELECT * FROM documents WHERE id = ?",
    [id]
  );
  if (!doc) return null;

  const pages = await db.getAllAsync<Page>(
    "SELECT * FROM pages WHERE document_id = ? ORDER BY page_number ASC",
    [id]
  );

  return { ...doc, pages };
}

export async function renameDocument(id: number, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE documents SET name = ?, updated_at = datetime('now') WHERE id = ?",
    [name, id]
  );
}

export async function deleteDocument(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM documents WHERE id = ?", [id]);
}

export async function getPageCount(): Promise<number> {
  const db = await getDb();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM pages"
  );
  return result?.count ?? 0;
}

export async function getDocumentCount(): Promise<number> {
  const db = await getDb();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM documents"
  );
  return result?.count ?? 0;
}
