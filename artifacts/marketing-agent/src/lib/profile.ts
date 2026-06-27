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

export const PROFILE_ID_KEY = "biz_profile_id";

/**
 * Reads the ?profile=UUID parameter from the current URL query string.
 */
export function getProfileIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("profile");
  return id && id.length > 0 ? id : null;
}

/**
 * Gets the stored profile ID from localStorage.
 */
export function getProfileIdFromStorage(): string | null {
  try {
    return localStorage.getItem(PROFILE_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Resolves the profile ID: URL param takes priority, then localStorage fallback.
 */
export function resolveProfileId(): string | null {
  return getProfileIdFromUrl() ?? getProfileIdFromStorage();
}

/**
 * Saves the profile ID to localStorage and appends it to the URL as a query param.
 */
export function persistProfileId(id: string) {
  try {
    localStorage.setItem(PROFILE_ID_KEY, id);
  } catch {
    // ignore storage errors
  }

  const url = new URL(window.location.href);
  url.searchParams.set("profile", id);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Clears the stored profile ID from localStorage and the URL.
 */
export function clearProfileId() {
  try {
    localStorage.removeItem(PROFILE_ID_KEY);
  } catch {
    // ignore storage errors
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("profile");
  window.history.replaceState({}, "", url.toString());
}
