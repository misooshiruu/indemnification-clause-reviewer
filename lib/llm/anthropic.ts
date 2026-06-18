import { explainHttpError, explainNetworkError } from "./errors";

export async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    throw new Error(explainNetworkError("Anthropic", e));
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(explainHttpError("Anthropic", res.status, detail, model));
  }

  const data = await res.json();
  const text = (data?.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
  if (!text) throw new Error("Anthropic returned an empty response.");
  return text;
}
