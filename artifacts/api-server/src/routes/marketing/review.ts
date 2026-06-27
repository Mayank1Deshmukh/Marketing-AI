import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  reviewStage1Prompt,
  reviewStage2Prompt,
  type BusinessProfile,
} from "./prompts";

const router = Router();

router.post("/review", async (req, res) => {
  try {
    const { profile, reviewText } = req.body as {
      profile: BusinessProfile;
      reviewText?: string | null;
    };

    if (!profile?.businessName || !profile?.city || !profile?.offerings) {
      res.status(400).json({ error: "Missing required profile fields" });
      return;
    }

    let sentiment: string | null = null;
    let highlights: string[] = [];

    const hasReview = reviewText && reviewText.trim().length > 0;

    if (hasReview) {
      // Stage 1: Sentiment parsing — extract specific praise or friction points
      const stage1Response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 256,
        messages: [{ role: "user", content: reviewStage1Prompt(reviewText) }],
      });

      const stage1Text = stage1Response.choices[0]?.message?.content ?? "{}";
      try {
        const parsed = JSON.parse(stage1Text) as {
          sentiment: string;
          highlights: string[];
        };
        sentiment = parsed.sentiment ?? null;
        highlights = parsed.highlights ?? [];
      } catch {
        sentiment = null;
        highlights = [];
      }
    }

    // Stage 2: Generate brand-voice-matched response (or fallback if no review)
    const stage2Response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [
        {
          role: "user",
          content: reviewStage2Prompt(
            profile,
            reviewText ?? null,
            sentiment,
            highlights,
          ),
        },
      ],
    });

    const response = stage2Response.choices[0]?.message?.content?.trim() ?? "";

    res.json({ sentiment, highlights, response });
  } catch (err) {
    req.log.error({ err }, "Review response generation failed");
    res.status(500).json({ error: "Failed to generate review response" });
  }
});

export default router;
