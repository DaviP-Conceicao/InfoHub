import { RowDataPacket } from "mysql2";
import { db } from "./db";

export type Category = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export async function getCategories(): Promise<Category[]> {
  const [rows] = await db.query<Category[]>(
    `
    SELECT
      id,
      name,
      slug,
      description
    FROM categories
    ORDER BY id ASC
    `
  );

  return rows;
}