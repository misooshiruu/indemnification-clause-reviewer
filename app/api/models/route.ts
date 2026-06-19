import { NextResponse } from "next/server";
import { listModels } from "@/lib/llm/listModels";
import type { BackendConfig } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { backend?: BackendConfig };
    if (!body.backend) {
      return NextResponse.json({ error: "Missing backend configuration." }, { status: 400 });
    }
    const models = await listModels(body.backend);
    return NextResponse.json({ models });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Couldn't list models.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
