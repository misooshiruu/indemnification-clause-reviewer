import { NextResponse } from "next/server";
import { analyze } from "@/lib/llm";
import type { BackendConfig, PartyConfig } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      clause?: string;
      party?: PartyConfig;
      backend?: BackendConfig;
    };

    const clause = body.clause?.trim();
    if (!clause) {
      return NextResponse.json({ error: "Paste a clause to review." }, { status: 400 });
    }
    if (!body.party || !body.backend) {
      return NextResponse.json(
        { error: "Missing party or backend configuration." },
        { status: 400 },
      );
    }

    const result = await analyze(clause, body.party, body.backend);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
