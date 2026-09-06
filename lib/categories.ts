import { db } from "./db";

export async function getCategories() {
  const [rows] = await db.query(`
    SELECT
      id,
      name,
      slug,
      description
    FROM categories
    ORDER BY id ASC
  `);

  return rows;
}
