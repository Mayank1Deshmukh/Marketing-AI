import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  gmbStage1Prompt,
  gmbStage2Prompt,
  type BusinessProfile,
} from "./prompts";

const router = Router();

const DISCLAIMER =
  "Suggested local search concepts. We recommend verifying search volume in Google Search Console or a free tool like Ubersuggest.";

router.post("/gmb", async (req, res) => {
  try {
    const { profile } = req.body as { profile: BusinessProfile };

    if (!profile?.businessName || !profile?.city || !profile?.offerings) {
      res.status(400).json({ error: "Missing required profile fields" });
      return;
    }

    // Stage 1: Enrichment — surface 2-3 localized SEO concepts
    const stage1Response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 256,
      messages: [{ role: "user", content: gmbStage1Prompt(profile) }],
    });

    const stage1Text = stage1Response.choices[0]?.message?.content ?? "[]";
    let concepts: string[] = [];
    try {
      concepts = JSON.parse(stage1Text);
    } catch {
      concepts = [stage1Text];
    }

    // Stage 2: Generate keyword-dense GMB update with local CTA
    const stage2Response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [{ role: "user", content: gmbStage2Prompt(profile, concepts) }],
    });

    const update = stage2Response.choices[0]?.message?.content?.trim() ?? "";

    res.json({ concepts, update, disclaimer: DISCLAIMER });
  } catch (err) {
    req.log.error({ err }, "GMB generation failed");
    res.status(500).json({ error: "Failed to generate GMB update" });
  }
});

export default router;
