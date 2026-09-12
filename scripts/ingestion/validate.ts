import type { IngestionCandidate } from "./types";

export function validateCandidate(
  candidate: IngestionCandidate
): string[] {
  const errors: string[] = [];

  if (!candidate.title.trim()) {
    errors.push("title obrigatório");
  }

  if (candidate.title.length > 200) {
    errors.push("title excede 200 caracteres");
  }

  if (!candidate.slug.trim()) {
    errors.push("slug obrigatório");
  }

  if (candidate.slug.length > 220) {
    errors.push("slug excede 220 caracteres");
  }

  if (!candidate.content.trim()) {
    errors.push("content obrigatório");
  }

  if (candidate.summary.length > 500) {
    errors.push("summary excede 500 caracteres");
  }

  if (!Number.isInteger(candidate.categoryId) || candidate.categoryId <= 0) {
    errors.push("categoryId inválido");
  }

  if (!Array.isArray(candidate.sources)) {
    errors.push("sources deve ser um array");
  }

  return errors;
}
