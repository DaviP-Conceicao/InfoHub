import { ingestionConfig } from "./config";
import type { IngestionCandidate } from "./types";

export async function sendCandidate(
  candidate: IngestionCandidate
): Promise<void> {
  const apiKey = process.env.INGESTION_API_KEY;

  if (!apiKey) {
    throw new Error(
      "INGESTION_API_KEY não configurada. Nenhum conteúdo foi enviado."
    );
  }

  const response = await fetch(
    `${ingestionConfig.apiUrl}/api/v1/contents`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        categoryId: candidate.categoryId,
        title: candidate.title,
        slug: candidate.slug,
        summary: candidate.summary,
        content: candidate.content,
        sources: candidate.sources,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `InfoHub API respondeu ${response.status}: ${body.slice(0, 500)}`
    );
  }
}
