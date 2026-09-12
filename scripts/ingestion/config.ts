export const ingestionConfig = {
  apiUrl:
    process.env.INFOHUB_API_URL ??
    "http://localhost:3000",

  dryRun:
    process.env.INGESTION_DRY_RUN !== "false",

  maxCandidates:
    Number(process.env.INGESTION_MAX_CANDIDATES ?? "5"),
};
