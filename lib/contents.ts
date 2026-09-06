import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";

export type Content = RowDataPacket & {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content?: string;
  data: unknown;
  category: string;
  category_slug: string;
};

export type CreateContentInput = {
  categoryId: number;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  data?: unknown;
  status?: "draft" | "published" | "archived";
};

export async function getPublishedContents(): Promise<Content[]> {
  const [rows] = await db.query<Content[]>(
    `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.summary,
      c.data,
      cat.name AS category,
      cat.slug AS category_slug
    FROM contents c
    INNER JOIN categories cat
      ON cat.id = c.category_id
    WHERE c.status = 'published'
    ORDER BY c.id DESC
    `
  );

  return rows;
}

export async function getPublishedContentBySlug(
  slug: string
): Promise<Content[]> {
  const [rows] = await db.query<Content[]>(
    `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.summary,
      c.content,
      c.data,
      cat.name AS category,
      cat.slug AS category_slug
    FROM contents c
    INNER JOIN categories cat
      ON cat.id = c.category_id
    WHERE c.slug = ?
      AND c.status = 'published'
    LIMIT 1
    `,
    [slug]
  );

  return rows;
}

export async function createContent(
  input: CreateContentInput
): Promise<number> {
  const [result] = await db.execute<ResultSetHeader>(
    `
    INSERT INTO contents (
      category_id,
      title,
      slug,
      summary,
      content,
      data,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.categoryId,
      input.title,
      input.slug,
      input.summary ?? null,
      input.content,
      input.data ? JSON.stringify(input.data) : null,
      input.status ?? "draft",
    ]
  );

  return result.insertId;
}