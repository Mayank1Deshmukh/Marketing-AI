import { Router } from "express";
import { generate } from "../../lib/gemini";
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
      // Stage 1: Sentiment parsing
      const stage1Text = await generate(reviewStage1Prompt(reviewText));
      try {
        const cleaned = stage1Text.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned) as { sentiment: string; highlights: string[] };
        sentiment = parsed.sentiment ?? null;
        highlights = parsed.highlights ?? [];
      } catch {
        sentiment = null;
        highlights = [];
      }
    }

    // Stage 2: Generate brand-voice-matched response
    const response = (
      await generate(reviewStage2Prompt(profile, reviewText ?? null, sentiment, highlights))
    ).trim();

    res.json({ sentiment, highlights, response });
  } catch (err) {
    req.log.error({ err }, "Review response generation failed");
    res.status(500).json({ error: "Failed to generate review response" });
  }
});

export default router;
