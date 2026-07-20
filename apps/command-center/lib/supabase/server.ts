type Query = Record<string, string | number | boolean | undefined>;

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("DATA_PLANE_UNAVAILABLE");
  return { url: url.replace(/\/$/, ""), key };
}

export async function dbRequest<T>(path: string, init: RequestInit = {}, query: Query = {}): Promise<T> {
  const { url, key } = config();
  const target = new URL(`${url}/rest/v1/${path}`);
  Object.entries(query).forEach(([name, value]) => value !== undefined && target.searchParams.set(name, String(value)));
  const response = await fetch(target, {
    ...init,
    cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
  });
  if (!response.ok) throw new Error(`DATA_PLANE_${response.status}`);
  return response.status === 204 ? ([] as T) : response.json();
}

export async function rpc<T>(name: string, body: unknown): Promise<T> {
  return dbRequest<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}
