import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGenerateSocialAd, useGetProfile } from "@workspace/api-client-react";
import type { SocialInputPlatform, Profile } from "@workspace/api-client-react";
import { Megaphone, Target } from "lucide-react";
import { resolveProfileId } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { EscapeValve } from "@/components/escape-valve";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SocialTrack() {
  const [_, setLocation] = useLocation();
  const [platform, setPlatform] = useState<SocialInputPlatform>("instagram");

  const profileId = resolveProfileId();
  const { data: profile, isLoading: isLoadingProfile } = useGetProfile(
    profileId ?? "",
    { query: { enabled: !!profileId, queryKey: profileId ? ["profile", profileId] : [] } },
  );

  const generateAd = useGenerateSocialAd();
  const [result, setResult] = useState<{
    framework: string;
    instagramCaption?: string | null;
    adCopy?: string | null;
    hashtags: string[];
  } | null>(null);

  useEffect(() => {
    if (!profileId) {
      setLocation("/");
    }
  }, [profileId, setLocation]);

  if (!profileId) return null;
  if (isLoadingProfile) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">No profile found. <Button variant="link" onClick={() => setLocation("/")}>Create one first.</Button></p>
      </div>
    );
  }

  const handleGenerate = () => {
    generateAd.mutate(
      { data: { profile: mapProfileToBusinessProfile(profile), platform } },
      {
        onSuccess: (data) => {
          setResult(data);
        },
      },
    );
  };

  const finalCopy = platform === "instagram" ? result?.instagramCaption : result?.adCopy;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-primary">Hyper-Local Social Ad</h1>
        <p className="text-muted-foreground">Stop guessing what to post. Get platform-specific ad copy that connects locally.</p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-card flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Target Platform</label>
            <Select value={platform} onValueChange={(val) => setPlatform(val as SocialInputPlatform)}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="nextdoor">Nextdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateAd.isPending}
            className="w-full sm:w-auto"
            data-testid="button-generate-social"
          >
            {generateAd.isPending ? "Generating..." : "Generate Ad"}
          </Button>
        </div>

        <CardContent className="p-0">
          {generateAd.isPending && (
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-3 pt-4 border-t border-border/50">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          )}

          {!generateAd.isPending && result && (
            <div className="divide-y border-border/50">
              <div className="p-6 bg-slate-50 dark:bg-slate-900/20">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Stage 1: Proximity Framework
                </h3>
                <div className="text-sm bg-white dark:bg-black/20 p-4 rounded-md border border-border/40 text-muted-foreground italic">
                  {result.framework}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Final Output: Ad Copy</h3>
                  <CopyButton text={finalCopy || ""} testId="button-copy-social" />
                </div>
                <div className="whitespace-pre-wrap text-base leading-relaxed bg-white dark:bg-black/10 p-5 rounded-lg border border-border shadow-sm mb-4">
                  {finalCopy}
                </div>

                {result.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {result.hashtags.map((tag, i) => (
                      <span key={i} className="text-xs font-medium text-accent-foreground bg-accent/20 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <EscapeValve
                  track="social"
                  originalPrompt={`Generate ${platform} ad copy using framework`}
                  originalOutput={finalCopy || ""}
                  profile={mapProfileToBusinessProfile(profile)}
                  onRegenerated={(newText) => setResult({
                    ...result,
                    [platform === "instagram" ? "instagramCaption" : "adCopy"]: newText,
                  })}
                  testIdSuffix="social"
                />
              </div>
            </div>
          )}

          {!generateAd.isPending && !result && (
            <div className="p-12 text-center text-muted-foreground">
              <p>Select a platform and click "Generate Ad" to create your copy.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function mapProfileToBusinessProfile(p: Profile) {
  return {
    businessName: p.businessName,
    city: p.city,
    neighborhoods: p.neighborhoods,
    landmarks: p.landmarks,
    offerings: p.offerings,
    brandVoice: p.brandVoice,
    secretSauce: p.secretSauce,
  };
}
