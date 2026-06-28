import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { customFetch } from "@workspace/api-client-react";
import type { Profile } from "@workspace/api-client-react";

export const MY_PROFILE_QUERY_KEY = ["profile", "me"] as const;

/**
 * Fetches the signed-in user's business profile from the server.
 * Uses the Clerk session token automatically (via setAuthTokenGetter in App.tsx).
 * Returns undefined (not loading) when the user is signed out.
 * Returns undefined (404, no error thrown) when the user has no profile yet.
 */
export function useMyProfile() {
  const { isSignedIn } = useAuth();

  return useQuery<Profile>({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: () => customFetch<Profile>("/api/profile/current"),
    enabled: !!isSignedIn,
    retry: (count, error: unknown) => {
      if ((error as { status?: number })?.status === 404) return false;
      return count < 2;
    },
    staleTime: 30_000,
  });
}
