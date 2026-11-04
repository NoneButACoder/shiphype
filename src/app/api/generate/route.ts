import { NextRequest, NextResponse } from "next/server";
import { parseGitHubPRUrl, fetchGitHubPR } from "@/lib/github";
import { generateReleasePack } from "@/lib/gemini";
import { GenerateRequest, GenerateResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await req.json();
    const { prUrl, notes, language } = body;

    if (!prUrl || typeof prUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid GitHub Pull Request URL." },
        { status: 400 }
      );
    }

    const parsed = parseGitHubPRUrl(prUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid GitHub PR URL format. Supported formats: https://github.com/owner/repo/pull/123 or owner/repo#123",
        },
        { status: 400 }
      );
    }

    // 1. Fetch PR details
    const pr = await fetchGitHubPR(parsed.owner, parsed.repo, parsed.pullNumber);

    // 2. Generate structured release pack via Gemini
    const { payload, unmatchedNumbers } = await generateReleasePack(pr, {
      notes: notes?.trim(),
      language,
    });

    return NextResponse.json({
      success: true,
      data: payload,
      pr,
      numbersAudit: {
        unmatchedNumbers,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred during generation.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
