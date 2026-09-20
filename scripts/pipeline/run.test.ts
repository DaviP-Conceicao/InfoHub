import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { after, before, test } from "node:test";

const executeFile = promisify(execFile);
const validFingerprint = "valid item|http://example.com/valid";
const rejectedFingerprint = "rejected item|invalid-url";

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <item>
    <title>Valid item</title>
    <link>http://example.com/valid</link>
    <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Rejected item</title>
    <link>invalid-url</link>
  </item>
</channel></rss>`;

let server: ReturnType<typeof createServer>;
let feedUrl: string;

before(async () => {
  server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "application/rss+xml" });
    response.end(feed);
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Não foi possível iniciar o servidor RSS de teste.");
  }

  feedUrl = `http://127.0.0.1:${address.port}/feed.xml`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

async function createTestDirectories() {
  const root = await mkdtemp(join(tmpdir(), "infohub-pipeline-test-"));

  return {
    root,
    bronzeDir: join(root, "bronze"),
    silverDir: join(root, "silver"),
  };
}

async function runPipeline(
  bronzeDir: string,
  silverDir: string,
  dryRun: boolean
) {
  await executeFile(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "scripts/pipeline/run.ts"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PIPELINE_RSS_URLS: feedUrl,
        PIPELINE_BRONZE_DIR: bronzeDir,
        PIPELINE_SILVER_DIR: silverDir,
        PIPELINE_DRY_RUN: String(dryRun),
      },
    }
  );
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await readdir(path);
    return true;
  } catch (error: unknown) {
    return !(
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    );
  }
}

test("dry-run não cria artefatos persistentes", async () => {
  const { root, bronzeDir, silverDir } = await createTestDirectories();

  try {
    await runPipeline(bronzeDir, silverDir, true);

    assert.equal(await pathExists(bronzeDir), false);
    assert.equal(await pathExists(silverDir), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("dry-run preserva o índice de fingerprints existente", async () => {
  const { root, bronzeDir, silverDir } = await createTestDirectories();
  const indexPath = join(silverDir, "processed-fingerprints.json");
  const initialIndex = '[\n  "existing-fingerprint"\n]\n';

  try {
    await mkdir(silverDir, { recursive: true });
    await writeFile(indexPath, initialIndex, "utf8");

    await runPipeline(bronzeDir, silverDir, true);

    assert.equal(await readFile(indexPath, "utf8"), initialIndex);
    assert.deepEqual(await readdir(silverDir), ["processed-fingerprints.json"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("execução real persiste artefatos e somente fingerprints válidos", async () => {
  const { root, bronzeDir, silverDir } = await createTestDirectories();

  try {
    await runPipeline(bronzeDir, silverDir, true);
    assert.equal(await pathExists(silverDir), false);

    await runPipeline(bronzeDir, silverDir, false);

    const bronzeBatches = await readdir(bronzeDir);
    const silverEntries = await readdir(silverDir);
    const batchId = silverEntries.find((entry) => entry !== "processed-fingerprints.json");

    assert.equal(bronzeBatches.length, 1);
    assert.deepEqual(
      await readdir(join(bronzeDir, bronzeBatches[0])),
      ["rss-1.json"]
    );
    assert.ok(batchId);

    const batchEntries = await readdir(join(silverDir, batchId));
    assert.deepEqual(batchEntries.sort(), [
      "items.json",
      "quality-report.json",
      "quarantine.json",
    ]);

    const fingerprints = JSON.parse(
      await readFile(join(silverDir, "processed-fingerprints.json"), "utf8")
    ) as string[];

    assert.ok(fingerprints.includes(validFingerprint));
    assert.ok(!fingerprints.includes(rejectedFingerprint));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
