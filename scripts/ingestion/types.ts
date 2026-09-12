export type IngestionSource = {
  name: string;
  url: string;
  sourceType: string;
};

export type IngestionCandidate = {
  title: string;
  summary: string;
  content: string;
  categoryId: number;
  slug: string;
  sources: IngestionSource[];
};
