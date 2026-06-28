import { useState } from "react";
import { useLocation } from "wouter";
import { useGenerateSocialAd } from "@workspace/api-client-react";
import type { SocialInputPlatform, Profile } from "@workspace/api-client-react";
import { Download, ImageIcon, Megaphone, RefreshCw, Target } from "lucide-react";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useHistory } from "@/hooks/useHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { EscapeValve } from "@/components/escape-valve";
import { HistoryPanel } from "@/components/history-panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLATFORM_DIMENSIONS: Record<SocialInputPlatform, { width: number; height: number; label: string }> = {
  instagram: { width: 1080, height: 1080, label: "Instagram square" },
  facebook:  { width: 1200, height: 628,  label: "Facebook landscape" },
  nextdoor:  { width: 1200, height: 900,  label: "Nextdoor post" },
};

function buildImagePrompt(profile: ReturnType<typeof mapProfile>, platform: SocialInputPlatform, adCopy: string) {
  const offerings = profile.offerings?.split(",")[0]?.trim() ?? "local business";
  const platformStyle: Record<SocialInputPlatform, string> = {
    instagram: "vibrant Instagram lifestyle photography, warm aesthetic",
    facebook: "friendly community Facebook ad photo, approachable",
    nextdoor: "authentic neighborhood photo, local community feel",
  };
  const lines = [
    `Professional ${platformStyle[platform]}`,
    `for a local ${offerings} business called "${profile.businessName}" in ${profile.city}`,
    profile.landmarks ? `near ${profile.landmarks}` : "",
    "no text overlay, no logos, photorealistic, high quality commercial photography",
    "warm natural lighting, inviting atmosphere",
  ].filter(Boolean);
  return lines.join(", ");
}

function buildPollinationsUrl(prompt: string, width: number, height: number, seed: number) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;
}

export function SocialTrack() {
  const [_, setLocation] = useLocation();
  const [platform, setPlatform] = useState<SocialInputPlatform>("instagram");
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  const history = useHistory("social");

  const generateAd = useGenerateSocialAd();
  const [result, setResult] = useState<{
    framework: string;
    instagramCaption?: string | null;
    adCopy?: string | null;
    hashtags: string[];
  } | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageSeed, setImageSeed] = useState(() => Math.floor(Math.random() * 999999));

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
        <p className="text-muted-foreground">
          No profile found.{" "}
          <Button variant="link" onClick={() => setLocation("/dashboard")}>
            Create one first.
          </Button>
        </p>
      </div>
    );
  }

  const handleGenerate = () => {
    setResult(null);
    setImageUrl(null);
    generateAd.mutate(
      { data: { profile: mapProfile(profile), platform } },
      {
        onSuccess: (data) => {
          setResult(data);
          const output = platform === "instagram" ? data.instagramCaption : data.adCopy;
          if (output) {
            history.addItem(output, { platform, hashtags: data.hashtags });
          }
        },
      },
    );
  };

  const handleGenerateImage = (newSeed?: number) => {
    if (!profile || !result) return;
    const mapped = mapProfile(profile);
    const copy = (platform === "instagram" ? result.instagramCaption : result.adCopy) ?? "";
    const prompt = buildImagePrompt(mapped, platform, copy);
    const seed = newSeed ?? imageSeed;
    const { width, height } = PLATFORM_DIMENSIONS[platform];
    setImageUrl(buildPollinationsUrl(prompt, width, height, seed));
    setImageLoading(true);
  };

  const handleRegenerateImage = () => {
    const newSeed = Math.floor(Math.random() * 999999);
    setImageSeed(newSeed);
    handleGenerateImage(newSeed);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${profile.businessName?.replace(/\s+/g, "-").toLowerCase() ?? "ad"}-${platform}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
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
            <Select value={platform} onValueChange={(val) => { setPlatform(val as SocialInputPlatform); setResult(null); setImageUrl(null); }}>
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
            {generateAd.isPending ? "Generating…" : "Generate Ad"}
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
                <div className="text-sm bg-white dark:bg-black/20 p-4 rounded-md border border-border/40 space-y-2">
                  {(() => {
                    try {
                      const fw = JSON.parse(result.framework) as Record<string, string>;
                      const labels: Record<string, string> = {
                        primaryGeoHook: "Primary Geo Hook",
                        physicalAnchor: "Physical Anchor",
                        emotionalPull: "Emotional Pull",
                        localUrgency: "Local Urgency",
                      };
                      return Object.entries(fw).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-muted-foreground font-medium shrink-0 w-36">{labels[k] ?? k}:</span>
                          <span className="text-foreground">{v}</span>
                        </div>
                      ));
                    } catch {
                      return <span className="text-muted-foreground italic">{result.framework}</span>;
                    }
                  })()}
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
                  profile={mapProfile(profile)}
                  onRegenerated={(newText) => {
                    setResult({
                      ...result,
                      [platform === "instagram" ? "instagramCaption" : "adCopy"]: newText,
                    });
                    history.addItem(newText, { platform });
                  }}
                  testIdSuffix="social"
                />
              </div>

              {/* ── Image Generation Section ── */}
              <div className="p-6 bg-slate-50/60 dark:bg-slate-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Ad Image
                    <span className="text-xs font-normal normal-case ml-1 text-muted-foreground/60">
                      ({PLATFORM_DIMENSIONS[platform].label})
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {imageUrl && !imageLoading && (
                      <>
                        <Button size="sm" variant="outline" onClick={handleRegenerateImage} className="gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5">
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </>
                    )}
                    {!imageUrl && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateImage()}
                        className="gap-1.5"
                        data-testid="button-generate-image"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Generate Image
                      </Button>
                    )}
                  </div>
                </div>

                {imageLoading && (
                  <div className="relative rounded-xl overflow-hidden border border-border/50 bg-white dark:bg-black/10">
                    <Skeleton className="w-full aspect-square" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-8 w-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                      <p className="text-sm font-medium">Creating your ad image…</p>
                      <p className="text-xs opacity-60">Usually takes 10–20 seconds</p>
                    </div>
                  </div>
                )}

                {imageUrl && (
                  <div className={`rounded-xl overflow-hidden border border-border/50 shadow-sm ${imageLoading ? "hidden" : "block"}`}>
                    <img
                      src={imageUrl}
                      alt={`${platform} ad image for ${profile.businessName}`}
                      className="w-full object-cover"
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                    />
                  </div>
                )}

                {!imageUrl && (
                  <div className="rounded-xl border border-dashed border-border/60 bg-white dark:bg-black/10 p-10 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Click "Generate Image" to create an AI photo for your ad.</p>
                    <p className="text-xs opacity-60 mt-1">Powered by Pollinations AI — free, no sign-up needed.</p>
                  </div>
                )}
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

      <HistoryPanel
        items={history.items}
        onClear={history.clearHistory}
        label="Recent Social Ads"
      />
    </div>
  );
}

function mapProfile(p: Profile) {
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
