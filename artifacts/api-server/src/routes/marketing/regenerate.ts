import { Router } from "express";
import { generate } from "../../lib/gemini";
import { regeneratePrompt, type BusinessProfile } from "./prompts";

const router = Router();

router.post("/regenerate", async (req, res) => {
  try {
    const { track, originalPrompt, originalOutput, tweakModifier, profile } = req.body as {
      track: string;
      originalPrompt: string;
      originalOutput: string;
      tweakModifier: string;
      profile: BusinessProfile;
    };

    if (!originalOutput || !tweakModifier || !profile) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const output = (
      await generate(regeneratePrompt(track, originalPrompt, originalOutput, tweakModifier))
    ).trim();

    res.json({ output });
  } catch (err) {
    req.log.error({ err }, "Regeneration failed");
    res.status(500).json({ error: "Failed to regenerate section" });
  }
});

export default router;
