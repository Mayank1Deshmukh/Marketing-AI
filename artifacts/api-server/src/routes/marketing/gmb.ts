import { Router } from "express";
import { generate } from "../../lib/gemini";
import { gmbStage1Prompt, gmbStage2Prompt, type BusinessProfile } from "./prompts";

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
    const stage1Text = await generate(gmbStage1Prompt(profile));
    let concepts: string[] = [];
    try {
      const cleaned = stage1Text.replace(/```json\n?|\n?```/g, "").trim();
      concepts = JSON.parse(cleaned);
    } catch {
      concepts = [stage1Text];
    }

    // Stage 2: Generate keyword-dense GMB update with local CTA
    const update = (await generate(gmbStage2Prompt(profile, concepts))).trim();

    res.json({ concepts, update, disclaimer: DISCLAIMER });
  } catch (err) {
    req.log.error({ err }, "GMB generation failed");
    res.status(500).json({ error: "Failed to generate GMB update" });
  }
});

export default router;
