import { NextResponse } from "next/server";
import { configuredProviders } from "@/lib/llm/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reports which cloud providers have an API key set in the server environment,
// so the UI can show a "key loaded / missing" status without ever exposing the
// key itself.
export async function GET() {
  return NextResponse.json(configuredProviders());
}
