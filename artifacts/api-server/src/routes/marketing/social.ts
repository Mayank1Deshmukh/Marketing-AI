import { Router } from "express";
import { generate } from "../../lib/gemini";
import {
  socialStage1Prompt,
  socialStage2InstagramPrompt,
  socialStage2AdPrompt,
  type BusinessProfile,
} from "./prompts";

const router = Router();

router.post("/social", async (req, res) => {
  try {
    const { profile, platform } = req.body as {
      profile: BusinessProfile;
      platform: "instagram" | "nextdoor" | "facebook";
    };

    if (!profile?.businessName || !profile?.city || !profile?.offerings) {
      res.status(400).json({ error: "Missing required profile fields" });
      return;
    }

    if (!["instagram", "nextdoor", "facebook"].includes(platform)) {
      res.status(400).json({ error: "Invalid platform" });
      return;
    }

    // Stage 1: Proximity frameworking
    const stage1Text = await generate(socialStage1Prompt(profile, platform));
    let framework: {
      primaryGeoHook: string;
      physicalAnchor: string;
      emotionalPull: string;
      localUrgency: string;
    } = {
      primaryGeoHook: profile.neighborhoods,
      physicalAnchor: profile.landmarks ?? "none provided",
      emotionalPull: `Fresh ${profile.offerings} in your neighborhood`,
      localUrgency: "Come visit us today",
    };

    try {
      const cleaned = stage1Text.replace(/```json\n?|\n?```/g, "").trim();
      framework = JSON.parse(cleaned);
    } catch {
      // keep defaults
    }

    const frameworkStr = JSON.stringify(framework);

    // Stage 2: Platform-ready copy
    let instagramCaption: string | null = null;
    let adCopy: string | null = null;
    let hashtags: string[] = [];

    if (platform === "instagram") {
      const stage2Text = await generate(socialStage2InstagramPrompt(profile, framework));
      try {
        const cleaned = stage2Text.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned) as { caption: string; hashtags: string[] };
        instagramCaption = parsed.caption ?? "";
        hashtags = parsed.hashtags ?? [];
      } catch {
        instagramCaption = stage2Text;
        hashtags = [];
      }
    } else {
      adCopy = (await generate(socialStage2AdPrompt(profile, platform, framework))).trim();
    }

    res.json({ framework: frameworkStr, instagramCaption, adCopy, hashtags });
  } catch (err) {
    req.log.error({ err }, "Social ad generation failed");
    res.status(500).json({ error: "Failed to generate social ad copy" });
  }
});

export default router;
