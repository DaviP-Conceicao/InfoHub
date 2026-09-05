import { db } from "./db";

export async function testDatabase() {
  const [rows] = await db.query("SELECT 1 AS connected");

  return rows;
}
