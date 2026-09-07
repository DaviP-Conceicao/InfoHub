import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, getDbConnection } from "./db";
import { getSourcesByContentId, type Source } from "./sources";

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

export type CreateContentSourceInput = {
  name: string;
  url: string;
  sourceType?: string;
  verifiedAt?: string | null;
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

export type ContentWithSources = Content & {
  sources: Source[];
};

export async function getPublishedContentBySlug(
  slug: string
): Promise<ContentWithSources[]> {
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

  if (rows.length === 0) {
    return [];
  }

  const content = rows[0];
  const sources = await getSourcesByContentId(content.id);

  return [
    {
      ...content,
      sources,
    },
  ];
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

export async function createContentWithSources(
  contentInput: CreateContentInput,
  sources: CreateContentSourceInput[]
): Promise<number> {
  const connection = await getDbConnection();

  try {
    await connection.beginTransaction();

    const [contentResult] = await connection.execute<ResultSetHeader>(
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
        contentInput.categoryId,
        contentInput.title,
        contentInput.slug,
        contentInput.summary ?? null,
        contentInput.content,
        contentInput.data ? JSON.stringify(contentInput.data) : null,
        contentInput.status ?? "draft",
      ]
    );

    const contentId = contentResult.insertId;

    for (const source of sources) {
      await connection.execute(
        `
        INSERT INTO sources (
          content_id,
          name,
          url,
          source_type,
          verified_at
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          contentId,
          source.name,
          source.url,
          source.sourceType ?? "other",
          source.verifiedAt ?? null,
        ]
      );
    }

    await connection.commit();

    return contentId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


export async function publishContentBySlug(slug: string): Promise<boolean> {
  const db = await getDbConnection();

  try {
    const [result] = await db.execute(
      `
        UPDATE contents
        SET status = 'published'
        WHERE slug = ?
          AND status = 'draft'
      `,
      [slug]
    );

    const affectedRows = (result as { affectedRows?: number }).affectedRows ?? 0;

    return affectedRows === 1;
  } finally {
    db.release();
  }
}
