import assert from "node:assert/strict";
import test from "node:test";

const authEnvironment = {
  AUTH_SECRET: "local-render-test-auth-secret-which-is-long-enough",
  AUTH_TRUST_HOST: "true",
  AUTH_MICROSOFT_ENTRA_ID_ID: "33333333-3333-4333-8333-333333333333",
  AUTH_MICROSOFT_ENTRA_ID_SECRET: "local-render-test-client-secret",
  AUTH_MICROSOFT_ENTRA_ID_ISSUER: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",
};

Object.assign(process.env, authEnvironment);

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    {
      ...authEnvironment,
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("requires a Microsoft Entra session for the command center", async () => {
  const response = await render("/");
  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    "http://localhost/signin?callbackUrl=%2F",
  );
  assert.equal(response.headers.get("cache-control"), "private, no-cache");
});

test("renders the Microsoft Entra sign-in boundary", async () => {
  const response = await render("/signin");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /SYMBIONT/i);
  assert.match(html, /Authorized access only/i);
  assert.match(html, /Continue with Microsoft/i);
  assert.match(html, /server-side authorization/i);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
});
