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
      `Couldn't reach Ollama at ${baseUrl}. Make sure it's installed and running (run "ollama serve"), and that the URL is correct. (${
        e instanceof Error ? e.message : String(e)
      })`,
    );
  }

  if (!res.ok) {
    const detail = (await res.text()).trim();
    if (res.status === 404 || /not found|no such model|try pulling/i.test(detail)) {
      throw new Error(
        `Ollama doesn't have the model "${model}". Pull it first with: ollama pull ${model}`,
      );
    }
    throw new Error(
      `Ollama error (HTTP ${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}.`,
    );
  }

  const data = await res.json();
  const text = data?.response;
  if (!text) throw new Error("Ollama returned an empty response.");
  return text;
}
