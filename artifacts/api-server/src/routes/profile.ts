import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

const TABLE = "business_profiles";

/**
 * GET /profile/:id
 * Fetch a saved business profile by ID.
 */
router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "Profile not found" });
    } else {
      req.log.error({ err: error }, "Failed to fetch profile");
      res.status(500).json({ error: "Failed to fetch profile" });
    }
    return;
  }

  res.json(data);
});

/**
 * POST /profile
 * Save (upsert) a business profile.
 * Body: { id?: string, businessName, city, neighborhoods, landmarks?, offerings, brandVoice, secretSauce }
 * Returns the saved profile including its id.
 */
router.post("/profile", async (req, res) => {
  const body = req.body as {
    id?: string;
    businessName: string;
    city: string;
    neighborhoods: string;
    landmarks?: string;
    offerings: string;
    brandVoice: string;
    secretSauce: string;
  };

  if (!body.businessName || !body.city || !body.neighborhoods || !body.offerings || !body.brandVoice || !body.secretSauce) {
    res.status(400).json({ error: "Missing required profile fields: businessName, city, neighborhoods, offerings, brandVoice, secretSauce" });
    return;
  }

  const record = {
    ...(body.id ? { id: body.id } : {}),
    business_name: body.businessName,
    city: body.city,
    neighborhoods: body.neighborhoods,
    landmarks: body.landmarks ?? null,
    offerings: body.offerings,
    brand_voice: body.brandVoice,
    secret_sauce: body.secretSauce,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(record, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    req.log.error({ err: error }, "Failed to save profile");
    res.status(500).json({ error: "Failed to save profile" });
    return;
  }

  res.status(201).json(data);
});

export default router;
