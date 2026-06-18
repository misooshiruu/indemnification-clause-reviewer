import { explainHttpError, explainNetworkError } from "./errors";

export async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
  } catch (e) {
    throw new Error(explainNetworkError("OpenAI", e));
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(explainHttpError("OpenAI", res.status, detail, model));
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}
