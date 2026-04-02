import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateSoloPlan } from "@/lib/solo-file-generator";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userInput = body?.prompt?.trim() || body?.userInput?.trim();

    if (!userInput) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    const parsedPlan = await generateSoloPlan(userInput);
    return NextResponse.json(parsedPlan);

  } catch (error) {
    console.error("SOLO GENERATION ERROR:", error);
    return NextResponse.json({ error: "Failed to generate workout" }, { status: 500 });
  }
}