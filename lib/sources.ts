import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";

export type Source = RowDataPacket & {
  id: number;
  content_id: number;
  name: string;
  url: string;
  source_type: string;
  verified_at: string | null;
  created_at: string;
};

export type CreateSourceInput = {
  contentId: number;
  name: string;
  url: string;
  sourceType?: string;
  verifiedAt?: string | null;
};

export async function createSource(
  input: CreateSourceInput
): Promise<number> {
  const [result] = await db.execute<ResultSetHeader>(
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
      input.contentId,
      input.name,
      input.url,
      input.sourceType ?? "other",
      input.verifiedAt ?? null,
    ]
  );

  return result.insertId;
}

export async function getSourcesByContentId(
  contentId: number
): Promise<Source[]> {
  const [rows] = await db.query<Source[]>(
    `
    SELECT
      id,
      content_id,
      name,
      url,
      source_type,
      verified_at,
      created_at
    FROM sources
    WHERE content_id = ?
    ORDER BY id ASC
    `,
    [contentId]
  );

  return rows;
}
