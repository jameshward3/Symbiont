import assert from "node:assert/strict";
import test from "node:test";
import {
  allowedEntraObjectIds,
  isMicrosoftEntraConfigured,
  microsoftEntraConfigurationStatus,
  tenantIdFromEntraIssuer,
} from "../../lib/entra-config.ts";

const tenantId = "11111111-1111-4111-8111-111111111111";
const objectId = "22222222-2222-4222-8222-222222222222";

test("accepts only a single-tenant Microsoft Entra issuer", () => {
  assert.equal(
    tenantIdFromEntraIssuer(
      `https://login.microsoftonline.com/${tenantId}/v2.0`,
    ),
    tenantId,
  );
  assert.equal(
    tenantIdFromEntraIssuer("https://login.microsoftonline.com/common/v2.0"),
    null,
  );
  assert.equal(tenantIdFromEntraIssuer("not-a-url"), null);
});

test("normalizes the optional immutable-object allowlist", () => {
  assert.deepEqual(
    allowedEntraObjectIds(`${objectId.toUpperCase()}, not-an-id`),
    [objectId],
  );
});

test("requires all server-side Entra secrets before reporting ready", () => {
  const original = {
    secret: process.env.AUTH_SECRET,
    clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
    clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
  };

  process.env.AUTH_SECRET = "x".repeat(32);
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID = "33333333-3333-4333-8333-333333333333";
  process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET = "client-secret";
  process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER = `https://login.microsoftonline.com/${tenantId}/v2.0`;
  assert.equal(isMicrosoftEntraConfigured(), true);

  delete process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
  assert.equal(isMicrosoftEntraConfigured(), false);
  assert.deepEqual(microsoftEntraConfigurationStatus(), {
    authSecret: true,
    clientId: true,
    clientSecret: false,
    issuer: true,
  });

  for (const [key, value] of Object.entries(original)) {
    const envKey = key === "secret" ? "AUTH_SECRET" : key === "clientId" ? "AUTH_MICROSOFT_ENTRA_ID_ID" : key === "clientSecret" ? "AUTH_MICROSOFT_ENTRA_ID_SECRET" : "AUTH_MICROSOFT_ENTRA_ID_ISSUER";
    if (value === undefined) delete process.env[envKey];
    else process.env[envKey] = value;
  }
});
