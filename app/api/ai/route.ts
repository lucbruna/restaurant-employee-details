import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getChatResponse, getMenuIntelligence } from "@/lib/ai";

type AIRequestBody = {
  type?: "chat" | "menu-intelligence";
  prompt?: string;
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = (await req.json()) as AIRequestBody;
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    let response: string;

    switch (body.type) {
      case "chat":
        response = await getChatResponse(prompt);
        break;
      case "menu-intelligence":
        response = await getMenuIntelligence(prompt);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported AI request type." },
          { status: 400 }
        );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[AI_ROUTE_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
