import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
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

    // Stage 1: Proximity frameworking — structure geographic details into copy hooks
    const stage1Response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 256,
      messages: [{ role: "user", content: socialStage1Prompt(profile, platform) }],
    });

    const stage1Text = stage1Response.choices[0]?.message?.content ?? "{}";
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
      framework = JSON.parse(stage1Text);
    } catch {
      // keep defaults
    }

    const frameworkStr = JSON.stringify(framework);

    // Stage 2: Generate platform-ready copy
    let instagramCaption: string | null = null;
    let adCopy: string | null = null;
    let hashtags: string[] = [];

    if (platform === "instagram") {
      const stage2Response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 512,
        messages: [
          {
            role: "user",
            content: socialStage2InstagramPrompt(profile, framework),
          },
        ],
      });
      const stage2Text = stage2Response.choices[0]?.message?.content ?? "{}";
      try {
        const parsed = JSON.parse(stage2Text) as {
          caption: string;
          hashtags: string[];
        };
        instagramCaption = parsed.caption ?? "";
        hashtags = parsed.hashtags ?? [];
      } catch {
        instagramCaption = stage2Text;
        hashtags = [];
      }
    } else {
      const stage2Response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 512,
        messages: [
          {
            role: "user",
            content: socialStage2AdPrompt(profile, platform, framework),
          },
        ],
      });
      adCopy = stage2Response.choices[0]?.message?.content?.trim() ?? "";
    }

    res.json({ framework: frameworkStr, instagramCaption, adCopy, hashtags });
  } catch (err) {
    req.log.error({ err }, "Social ad generation failed");
    res.status(500).json({ error: "Failed to generate social ad copy" });
  }
});

export default router;
