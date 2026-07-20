import assert from "node:assert/strict";
import test from "node:test";
import { OpenAIResponsesProvider } from "../../lib/agents/provider.ts";

test("agent provider handles a mocked Responses API result", async () => {
  const originalFetch = globalThis.fetch; const oldKey = process.env.OPENAI_API_KEY; const oldModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = "test-only"; process.env.OPENAI_MODEL = "configured-test-model";
  globalThis.fetch = async (_input, init) => { const body = JSON.parse(String(init?.body)); assert.equal(body.store, false); assert.equal(body.model, "configured-test-model"); return new Response(JSON.stringify({ output: [{ type: "message", content: [{ type: "output_text", text: "Verified facts: mock only" }] }] }), { status: 200 }); };
  try { const result = await new OpenAIResponsesProvider().respond({ instructions: "Stay governed", input: "Draft analysis" }); assert.equal(result.text, "Verified facts: mock only"); }
  finally { globalThis.fetch = originalFetch; if (oldKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = oldKey; if (oldModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = oldModel; }
});
