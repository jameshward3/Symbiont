import assert from "node:assert/strict";
import test from "node:test";

const testPassword = "local-render-test-password";
const authorization = `Basic ${Buffer.from(`symbiont:${testPassword}`).toString("base64")}`;
process.env.SITE_PASSWORD = testPassword;

async function render(authenticated = true) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const headers = { accept: "text/html" };
  if (authenticated) headers.authorization = authorization;
  return worker.fetch(
    new Request("http://localhost/", { headers }),
    {
      SITE_PASSWORD: testPassword,
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("requires the static site password", async () => {
  const response = await render(false);
  assert.equal(response.status, 401);
  assert.match(response.headers.get("www-authenticate") ?? "", /Basic realm=/);
});

test("renders the Symbiont agent command center", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Symbiont — Executive Command Center/i);
  assert.match(html, /Agent Network/i);
  assert.match(html, /Shared Goals/i);
  assert.match(html, /Sales Operations/i);
  assert.match(html, /Opportunity Scout/i);
  assert.match(html, /Delivery Control/i);
  assert.match(html, /Quality/i);
  assert.match(html, /Knowledge/i);
  assert.match(html, /Reliability/i);
  assert.match(html, /Technical Architecture/i);
  assert.match(html, /Client Success/i);
  assert.match(html, /AGT-003/i);
  assert.match(html, /AGT-004/i);
  assert.match(html, /AGT-005/i);
  assert.match(html, /AGT-008/i);
  assert.match(html, /AGT-009/i);
  assert.match(html, /AGT-012/i);
  assert.match(html, /AGT-013/i);
  assert.match(html, /Demonstration data/i);
  assert.match(html, /Runtime unavailable/i);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
});
