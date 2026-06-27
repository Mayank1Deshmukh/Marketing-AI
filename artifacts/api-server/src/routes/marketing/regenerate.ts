import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { regeneratePrompt, type BusinessProfile } from "./prompts";

const router = Router();

router.post("/regenerate", async (req, res) => {
  try {
    const { track, originalPrompt, originalOutput, tweakModifier, profile } =
      req.body as {
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

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [
        {
          role: "user",
          content: regeneratePrompt(track, originalPrompt, originalOutput, tweakModifier),
        },
      ],
    });

    const output = response.choices[0]?.message?.content?.trim() ?? "";

    res.json({ output });
  } catch (err) {
    req.log.error({ err }, "Regeneration failed");
    res.status(500).json({ error: "Failed to regenerate section" });
  }
});

export default router;
