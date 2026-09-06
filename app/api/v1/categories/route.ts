import { NextResponse } from "next/server";
import { getCategories } from "@/lib/categories";

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json({
      data: categories,
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
