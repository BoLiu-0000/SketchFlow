import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the SketchFlow creation workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>灵图 SketchFlow · AI 概念草图工作台<\/title>/i);
  assert.match(html, /生成概念草图/);
  assert.match(html, /AI 需求理解/);
  assert.match(html, /添加参考/);
  assert.doesNotMatch(html, /codex-preview|Building your site/);
});

test("keeps Kimi credentials server-side and enables the requested workflows", async () => {
  const [page, route, envExample, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/kimi/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(route, /process\.env\.(MOONSHOT_API_KEY|OPENAI_API_KEY)/);
  assert.match(route, /reasoning_effort:\s*"high"/);
  assert.match(route, /response_format/);
  assert.doesNotMatch(page, /api\.moonshot\.cn|MOONSHOT_API_KEY/);
  assert.match(page, /function ProjectEditor/);
  assert.match(page, /上传项目到灵感/);
  assert.match(page, /pptx\.writeFile/);
  assert.match(envExample, /^MOONSHOT_API_KEY=/m);
  assert.match(packageJson, /"pptxgenjs"/);
});
