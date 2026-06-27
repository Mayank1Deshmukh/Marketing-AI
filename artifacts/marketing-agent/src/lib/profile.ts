import { z } from "zod";

export const BusinessProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  city: z.string().min(1, "City/Location is required"),
  neighborhoods: z.string().min(1, "Neighborhoods are required"),
  landmarks: z.string().optional(),
  offerings: z.string().min(1, "Key offerings are required"),
  brandVoice: z.enum(["friendly", "professional", "playful", "nononsense"], {
    required_error: "Please select a brand voice",
  }),
  secretSauce: z.string().min(1, "What makes you special is required"),
});

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

export const BIZ_PROFILE_KEY = "biz_profile";

export function getProfile(): BusinessProfile | null {
  try {
    const raw = localStorage.getItem(BIZ_PROFILE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const result = BusinessProfileSchema.safeParse(data);
    if (result.success) return result.data;
    return null;
  } catch (e) {
    return null;
  }
}

export function saveProfile(profile: BusinessProfile) {
  localStorage.setItem(BIZ_PROFILE_KEY, JSON.stringify(profile));
}
