export type ModelRequest = { instructions: string; input: string };
export interface AgentProvider { name: string; respond(request: ModelRequest): Promise<{ text: string; model: string }> }

export class OpenAIResponsesProvider implements AgentProvider {
  name = "openai";
  async respond(request: ModelRequest) {
    const key = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;
    if (!key || !model) throw new Error("MODEL_UNAVAILABLE");
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, instructions: request.instructions, input: request.input, store: false }) });
    if (!response.ok) throw new Error(`MODEL_${response.status}`);
    const data = await response.json() as { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
    const text = data.output_text ?? data.output?.flatMap(item => item.content ?? []).filter(item => item.type === "output_text").map(item => item.text ?? "").join("").trim();
    if (!text) throw new Error("MODEL_EMPTY");
    return { text, model };
  }
}
