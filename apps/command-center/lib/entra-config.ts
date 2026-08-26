const ENTRA_TENANT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function tenantIdFromEntraIssuer(
  issuer = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
) {
  if (!issuer) return null;

  try {
    const segments = new URL(issuer).pathname.split("/").filter(Boolean);
    const tenantId = segments[0]?.toLowerCase();
    const protocolVersion = segments[1]?.toLowerCase();

    if (
      !tenantId ||
      protocolVersion !== "v2.0" ||
      !ENTRA_TENANT_ID_PATTERN.test(tenantId)
    ) {
      return null;
    }

    return tenantId;
  } catch {
    return null;
  }
}

export function allowedEntraObjectIds(
  value = process.env.AUTH_MICROSOFT_ENTRA_ID_ALLOWED_OBJECT_IDS,
) {
  return (value ?? "")
    .split(",")
    .map((objectId) => objectId.trim().toLowerCase())
    .filter((objectId) => ENTRA_TENANT_ID_PATTERN.test(objectId));
}

export function isAllowedEntraObjectId(objectId: string | undefined) {
  if (!objectId) return false;
  const allowlist = allowedEntraObjectIds();
  return allowlist.length === 0 || allowlist.includes(objectId.toLowerCase());
}

export function isMicrosoftEntraConfigured() {
  return Object.values(microsoftEntraConfigurationStatus()).every(Boolean);
}

export function microsoftEntraConfigurationStatus() {
  return {
    authSecret: (process.env.AUTH_SECRET?.trim().length ?? 0) >= 32,
    clientId: Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID?.trim()),
    clientSecret: Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET?.trim()),
    issuer: Boolean(tenantIdFromEntraIssuer()),
  };
}
