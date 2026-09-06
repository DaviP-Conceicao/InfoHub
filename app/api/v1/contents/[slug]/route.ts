import { NextResponse } from "next/server";
import { getPublishedContentBySlug } from "@/lib/contents";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    const rows = await getPublishedContentBySlug(slug);

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          error: "Conteúdo não encontrado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: rows[0],
    });
  } catch (error) {
    console.error("Content API error:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar o conteúdo.",
      },
      { status: 500 }
    );
  }
}
