import {
  createContent,
  getPublishedContents,
  type CreateContentInput,
} from "@/lib/contents";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error: "O corpo da requisição deve ser um objeto JSON.",
        },
        { status: 400 }
      );
    }

    const {
      categoryId,
      title,
      slug,
      summary,
      content,
      data,
    } = body;

    if (
      typeof categoryId !== "number" ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          error: "categoryId deve ser um número inteiro positivo.",
        },
        { status: 400 }
      );
    }

    if (typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        {
          error: "title é obrigatório.",
        },
        { status: 400 }
      );
    }

    if (typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        {
          error: "slug é obrigatório.",
        },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        {
          error: "content é obrigatório.",
        },
        { status: 400 }
      );
    }

    if (
      summary !== undefined &&
      summary !== null &&
      typeof summary !== "string"
    ) {
      return NextResponse.json(
        {
          error: "summary deve ser uma string ou null.",
        },
        { status: 400 }
      );
    }

    const input: CreateContentInput = {
      categoryId,
      title: title.trim(),
      slug: slug.trim(),
      summary: summary?.trim() || null,
      content: content.trim(),
      data,
      status: "draft",
    };

    const id = await createContent(input);

    return NextResponse.json(
      {
        data: {
          id,
          status: "draft",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create content API error:", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o conteúdo.",
      },
      { status: 500 }
    );
  }
}