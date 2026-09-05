import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        slug,
        description
      FROM categories
      ORDER BY id
    `);

    return NextResponse.json({
      data: rows,
    });
  } catch (error) {
    console.error("Categories API error:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar as categorias.",
      },
      { status: 500 }
    );
  }
}
