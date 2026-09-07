import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { publishContentBySlug } from "@/lib/contents";

function isValidApiKey(request: NextRequest): boolean {
  const configuredApiKey = process.env.PUBLISH_API_KEY;

  if (!configuredApiKey) {
    console.error("PUBLISH_API_KEY não configurada.");
    return false;
  }

  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return false;
  }

  const expectedAuthorization = `Bearer ${configuredApiKey}`;

  const providedBuffer = Buffer.from(authorization);
  const expectedBuffer = Buffer.from(expectedAuthorization);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const configuredApiKey = process.env.PUBLISH_API_KEY;

  if (!configuredApiKey) {
    return NextResponse.json(
      { error: "Serviço de publicação não configurado." },
      { status: 503 }
    );
  }

  if (!isValidApiKey(request)) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  const { slug } = await context.params;

  if (!slug || slug.length > 220) {
    return NextResponse.json(
      { error: "Slug inválido." },
      { status: 400 }
    );
  }

  try {
    const published = await publishContentBySlug(slug);

    if (!published) {
      return NextResponse.json(
        {
          error:
            "Conteúdo não encontrado como rascunho ou já publicado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          slug,
          status: "published",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao publicar conteúdo:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
