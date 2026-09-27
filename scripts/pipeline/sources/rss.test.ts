import assert from "node:assert/strict";
import { test } from "node:test";

import { fetchRssSource, validateRssUrl } from "./rss";

const source = {
  id: "rss-test",
  name: "RSS test",
  url: "https://example.com/feed.xml",
  type: "rss" as const,
};

const response = (status: number, headers: Record<string, string> = {}) =>
  new Response(
    "<rss><channel><item><title>Teste</title><link>https://example.com/item</link></item></channel></rss>",
    { status, headers }
  );

test("protege a coleta RSS contra SSRF", async () => {
  assert.equal(validateRssUrl("http://example.com/feed").protocol, "http:");
  assert.equal(validateRssUrl("https://example.com/feed").protocol, "https:");

  for (const url of [
    "https://user:password@example.com/feed",
    "file:///tmp/feed.xml",
    "http://localhost/feed",
    "http://127.0.0.1/feed",
    "http://10.0.0.1/feed",
    "http://[::1]/feed",
  ]) {
    assert.throws(() => validateRssUrl(url), { message: /não permitida/ }, url);
  }

  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () =>
      response(302, { location: "http://127.0.0.1/private" });
    await assert.rejects(fetchRssSource(source), /não permitida/);

    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return calls === 1
        ? response(302, { location: "https://example.com/redirected.xml" })
        : response(200);
    };

    const items = await fetchRssSource(source);
    assert.equal(calls, 2);
    assert.equal(items.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
