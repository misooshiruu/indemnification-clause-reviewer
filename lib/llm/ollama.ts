export async function callOllama(
  baseUrl: string,
  model: string,
  prompt: string,
): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/generate`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json",
      }),
    });
  } catch (e) {
    throw new Error(
      `Could not reach Ollama at ${baseUrl}. Is it running? (ollama serve) — ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Ollama error (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const text = data?.response;
  if (!text) throw new Error("Ollama returned an empty response.");
  return text;
}
