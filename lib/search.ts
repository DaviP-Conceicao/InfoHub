import { RowDataPacket } from "mysql2";
import { db } from "./db";

export type SearchResult = RowDataPacket & {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  category: string;
  category_slug: string;
};

const MAX_QUERY_LENGTH = 100;
const MAX_RESULTS = 50;

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export async function searchPublishedContents(
  query: string
): Promise<SearchResult[]> {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery || normalizedQuery.length > MAX_QUERY_LENGTH) {
    return [];
  }

  const [rows] = await db.query<SearchResult[]>(
    `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.summary,
      cat.name AS category,
      cat.slug AS category_slug
    FROM contents c
    INNER JOIN categories cat
      ON cat.id = c.category_id
    WHERE c.status = 'published'
      AND (
        LOCATE(LOWER(?), LOWER(c.title)) > 0
        OR LOCATE(LOWER(?), LOWER(COALESCE(c.summary, ''))) > 0
        OR LOCATE(LOWER(?), LOWER(c.content)) > 0
        OR LOCATE(LOWER(?), LOWER(cat.name)) > 0
      )
    ORDER BY
      CASE
        WHEN LOWER(c.title) = LOWER(?) THEN 0
        WHEN LEFT(LOWER(c.title), CHAR_LENGTH(?)) = LOWER(?) THEN 1
        ELSE 2
      END,
      c.id DESC
    LIMIT ${MAX_RESULTS}
    `,
    [
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
    ]
  );

  return rows;
}
