import { Router } from "express";
import { createHash } from "crypto";
import { getAuth } from "@clerk/express";
import { supabase } from "../lib/supabase";

const router = Router();
const TABLE = "business_profiles";

/**
 * Derives a deterministic UUID from a Clerk user ID.
 * Same user always maps to the same profile row — no schema migration needed.
 */
function userToProfileId(clerkUserId: string): string {
  const hash = createHash("sha256").update(`localbrand:${clerkUserId}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `${((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

/**
 * GET /profile/me
 * Fetch the signed-in user's business profile (keyed by Clerk userId).
 */
router.get("/profile/me", async (req, res) => {
  const { userId } = getAuth(req);
  const profileId = userToProfileId(userId!);

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", profileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "No profile yet" });
    } else {
      req.log.error({ err: error }, "Failed to fetch profile");
      res.status(500).json({ error: "Failed to fetch profile" });
    }
    return;
  }

  res.json(data);
});

/**
 * GET /profile/:id
 * Fetch a saved business profile by UUID — only the owner may access it.
 */
router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = getAuth(req);
  const ownProfileId = userToProfileId(userId!);

  if (id !== ownProfileId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

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
 * Save (upsert) the signed-in user's business profile.
 * The profile UUID is always derived from the Clerk userId — never trusted from the client.
 */
router.post("/profile", async (req, res) => {
  const { userId } = getAuth(req);

  const body = req.body as {
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
    id: userToProfileId(userId!),
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
