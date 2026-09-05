import { db } from "./db";

export async function getPublishedContents() {
  const [rows] = await db.query(`
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
  `);

  return rows;
}
