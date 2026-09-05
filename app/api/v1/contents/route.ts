import { NextResponse } from "next/server";
import { getPublishedContents } from "@/lib/contents";

export async function GET() {
  try {
    const contents = await getPublishedContents();

    return NextResponse.json({
      data: contents,
    });
  } catch (error) {
    console.error("Contents API error:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar os conteúdos.",
      },
      { status: 500 }
    );
  }
}
