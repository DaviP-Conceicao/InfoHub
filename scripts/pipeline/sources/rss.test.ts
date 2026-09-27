import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { promises as dnsPromises } from "node:dns";
import http from "node:http";
import { mock, test } from "node:test";

import {
  readLimitedRssBody,
  fetchRssSource,
  validateResolvedRssAddresses,
  validateRssUrl,
} from "./rss";
import type { IncomingMessage } from "node:http";

const source = {
  id: "rss-test",
  name: "RSS test",
  url: "http://feed.example.test/feed.xml",
  type: "rss" as const,
};

const feed = "<rss><channel><item><title>Teste</title><link>https://example.com/item</link></item></channel></rss>";

function streamResponse(chunks: Uint8Array[], contentLength?: string): IncomingMessage {
  const stream = Readable.from(chunks) as IncomingMessage;
  stream.headers = contentLength ? { "content-length": contentLength } : {};
  return stream;
}

test("protege a coleta RSS contra SSRF", () => {
  assert.equal(validateRssUrl("http://example.com/feed").protocol, "http:");
  assert.equal(validateRssUrl("https://example.com/feed").hostname, "example.com");
  for (const url of [
    "https://user:password@example.com/feed",
    "file:///tmp/feed.xml",
    "http://localhost/feed",
    "http://127.0.0.1/feed",
    "http://10.0.0.1/feed",
    "http://[::1]/feed",
    "http://[fc00::1]/feed",
    "http://[fe80::1]/feed",
  ]) {
    assert.throws(() => validateRssUrl(url), /não permitida/, url);
  }
});

test("rejeita hostname público que resolve para loopback ou inclui IP bloqueado", () => {
  assert.throws(() => validateResolvedRssAddresses([{ address: "127.0.0.1" }]), /não permitida/);
  assert.throws(() => validateResolvedRssAddresses([
    { address: "93.184.216.34" },
    { address: "10.0.0.2" },
  ]), /não permitida/);
  assert.throws(() => validateResolvedRssAddresses([{ address: "::1" }]), /não permitida/);
  assert.throws(() => validateResolvedRssAddresses([{ address: "fe80::1" }]), /não permitida/);
  assert.throws(() => validateResolvedRssAddresses([{ address: "ff02::1" }]), /não permitida/);
  assert.throws(() => validateResolvedRssAddresses([{ address: "fc00::1" }]), /não permitida/);
  assert.throws(() => validateResolvedRssAddresses([{ address: "2001:db8::1" }]), /não permitida/);
  assert.throws(() => validateResolvedRssAddresses([{ address: "::ffff:10.0.0.1" }]), /não permitida/);
  assert.doesNotThrow(() => validateResolvedRssAddresses([{ address: "2001:4860:4860::8888" }]));
  assert.doesNotThrow(() => validateResolvedRssAddresses([{ address: "::ffff:93.184.216.34" }]));
  assert.doesNotThrow(() => validateResolvedRssAddresses([
    { address: "93.184.216.34" },
    { address: "2606:4700:4700::1111" },
  ]));
});

function mockHttpResponses(responses: Array<{ statusCode: number; headers?: Record<string, string>; body?: string }>) {
  let calls = 0;
  mock.method(dnsPromises, "lookup", async () => [{ address: "93.184.216.34", family: 4 }]);
  mock.method(http, "request", ((...args: unknown[]) => {
    const callback = args[2] as (response: IncomingMessage) => void;
    const current = responses[calls++];
    const response = Readable.from([Buffer.from(current.body ?? "")]) as IncomingMessage;
    response.statusCode = current.statusCode;
    response.headers = current.headers ?? {};
    callback(response);
    return { once: () => undefined, end: () => undefined };
  }) as unknown as typeof http.request);
  return () => calls;
}

test("fetchRssSource rejeita redirect bloqueado antes de requisitá-lo", async () => {
  const calls = mockHttpResponses([{ statusCode: 302, headers: { location: "http://127.0.0.1/private" } }]);
  await assert.rejects(fetchRssSource(source), /não permitida/);
  assert.equal(calls(), 1);
  mock.restoreAll();
});

test("fetchRssSource segue redirect público válido", async () => {
  const calls = mockHttpResponses([
    { statusCode: 302, headers: { location: "http://redirect.example.test/feed.xml" } },
    { statusCode: 200, body: feed },
  ]);
  const items = await fetchRssSource(source);
  assert.equal(calls(), 2);
  assert.equal(items.length, 1);
  mock.restoreAll();
});

test("limita o corpo RSS em bytes e aceita conteúdo dentro do limite", async () => {
  const controller = new AbortController();
  const valid = "<rss><channel><item/></channel></rss>";
  assert.equal(await readLimitedRssBody(streamResponse([Buffer.from(valid)]), controller.signal), valid);

  const oversized = Buffer.alloc(2 * 1024 * 1024 + 1, 0x61);
  await assert.rejects(
    readLimitedRssBody(streamResponse([oversized]), controller.signal),
    { message: "Resposta RSS excede o limite permitido." },
  );
});
