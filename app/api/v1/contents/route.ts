import {
  createContentWithSources,
  getPublishedContents,
  type CreateContentInput,
  type CreateContentSourceInput,
} from "@/lib/contents";
import { getCategories } from "@/lib/categories";
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
      sources,
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

    const categories = await getCategories();
    const categoryExists = categories.some(
      (category) => category.id === categoryId
    );

    if (!categoryExists) {
      return NextResponse.json(
        {
          error: "categoryId não corresponde a uma categoria existente.",
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

    if (title.trim().length > 200) {
      return NextResponse.json(
        {
          error: "title deve possuir no máximo 200 caracteres.",
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

    if (slug.trim().length > 220) {
      return NextResponse.json(
        {
          error: "slug deve possuir no máximo 220 caracteres.",
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

    if (
      typeof summary === "string" &&
      summary.trim().length > 500
    ) {
      return NextResponse.json(
        {
          error: "summary deve possuir no máximo 500 caracteres.",
        },
        { status: 400 }
      );
    }

    if (sources !== undefined && !Array.isArray(sources)) {
      return NextResponse.json(
        {
          error: "sources deve ser uma lista.",
        },
        { status: 400 }
      );
    }

    const normalizedSources: CreateContentSourceInput[] = [];

    for (const source of sources ?? []) {
      if (
        !source ||
        typeof source !== "object" ||
        Array.isArray(source)
      ) {
        return NextResponse.json(
          {
            error: "Cada item de sources deve ser um objeto.",
          },
          { status: 400 }
        );
      }

      if (
        typeof source.name !== "string" ||
        source.name.trim() === ""
      ) {
        return NextResponse.json(
          {
            error: "Cada fonte deve possuir um name válido.",
          },
          { status: 400 }
        );
      }

      if (
        typeof source.url !== "string" ||
        source.url.trim() === ""
      ) {
        return NextResponse.json(
          {
            error: "Cada fonte deve possuir uma url válida.",
          },
          { status: 400 }
        );
      }

      if (source.name.trim().length > 200) {
        return NextResponse.json(
          {
            error: "O name da fonte deve possuir no máximo 200 caracteres.",
          },
          { status: 400 }
        );
      }

      const normalizedUrl = source.url.trim();

      if (normalizedUrl.length > 2048) {
        return NextResponse.json(
          {
            error: "A url da fonte deve possuir no máximo 2048 caracteres.",
          },
          { status: 400 }
        );
      }

      let parsedUrl: URL;

      try {
        parsedUrl = new URL(normalizedUrl);
      } catch {
        return NextResponse.json(
          {
            error: "A url da fonte deve ser uma URL válida.",
          },
          { status: 400 }
        );
      }

      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        return NextResponse.json(
          {
            error: "A url da fonte deve utilizar http ou https.",
          },
          { status: 400 }
        );
      }

      if (
        source.sourceType !== undefined &&
        typeof source.sourceType !== "string"
      ) {
        return NextResponse.json(
          {
            error: "sourceType deve ser uma string.",
          },
          { status: 400 }
        );
      }

      const normalizedSourceType =
        source.sourceType?.trim() || "other";

      if (normalizedSourceType.length > 50) {
        return NextResponse.json(
          {
            error: "sourceType deve possuir no máximo 50 caracteres.",
          },
          { status: 400 }
        );
      }

      if (
        source.verifiedAt !== undefined &&
        source.verifiedAt !== null &&
        typeof source.verifiedAt !== "string"
      ) {
        return NextResponse.json(
          {
            error: "verifiedAt deve ser uma string ou null.",
          },
          { status: 400 }
        );
      }

      if (
        typeof source.verifiedAt === "string" &&
        !/^\d{4}-\d{2}-\d{2}$/.test(source.verifiedAt)
      ) {
        return NextResponse.json(
          {
            error: "verifiedAt deve estar no formato YYYY-MM-DD.",
          },
          { status: 400 }
        );
      }

      normalizedSources.push({
        name: source.name.trim(),
        url: normalizedUrl,
        sourceType: normalizedSourceType,
        verifiedAt: source.verifiedAt ?? null,
      });
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

    const id = await createContentWithSources(
      input,
      normalizedSources
    );

    return NextResponse.json(
      {
        data: {
          id,
          status: "draft",
          sources: normalizedSources.length,
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
