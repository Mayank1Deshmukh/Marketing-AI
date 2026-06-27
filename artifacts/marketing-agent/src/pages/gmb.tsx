import { useState } from "react";
import { useLocation } from "wouter";
import { useGenerateGmbUpdate } from "@workspace/api-client-react";
import { MapPin, Info } from "lucide-react";
import { useMyProfile } from "@/hooks/useMyProfile";
import type { Profile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { EscapeValve } from "@/components/escape-valve";

export function GmbTrack() {
  const [_, setLocation] = useLocation();
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();

  const generateGmb = useGenerateGmbUpdate();
  const [result, setResult] = useState<{
    concepts: string[];
    update: string;
    disclaimer: string;
  } | null>(null);

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
    generateGmb.mutate(
      { data: { profile: mapProfileToBusinessProfile(profile) } },
      {
        onSuccess: (data) => {
          setResult(data);
        },
      },
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-primary">Google My Business Post</h1>
        <p className="text-muted-foreground">Keep your local SEO fresh with a keyword-rich update based on your profile.</p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="bg-secondary/50 p-4 border-b flex items-center justify-between">
          <div className="text-sm font-medium">Generating for: <span className="text-primary font-bold">{profile.businessName}</span></div>
          <Button
            onClick={handleGenerate}
            disabled={generateGmb.isPending}
            data-testid="button-generate-gmb"
          >
            {generateGmb.isPending ? "Generating..." : "Generate Post"}
          </Button>
        </div>
        <CardContent className="p-0">
          {generateGmb.isPending && (
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-3 pt-4 border-t border-border/50">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          )}

          {!generateGmb.isPending && result && (
            <div className="divide-y border-border/50">
              <div className="p-6 bg-slate-50 dark:bg-slate-900/20">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Stage 1: Local SEO Concepts
                </h3>
                <ul className="space-y-2 mb-4">
                  {result.concepts.map((concept, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-accent mt-0.5">&#8226;</span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
                {result.disclaimer && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white dark:bg-black/20 p-3 rounded-md border border-border/40">
                    <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <p>{result.disclaimer}</p>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Final Output: GMB Post</h3>
                  <CopyButton text={result.update} testId="button-copy-gmb" />
                </div>
                <div className="whitespace-pre-wrap text-base leading-relaxed bg-white dark:bg-black/10 p-5 rounded-lg border border-border shadow-sm">
                  {result.update}
                </div>

                <EscapeValve
                  track="gmb"
                  originalPrompt="Generate Google My Business update based on concepts"
                  originalOutput={result.update}
                  profile={mapProfileToBusinessProfile(profile)}
                  onRegenerated={(newText) => setResult({ ...result, update: newText })}
                  testIdSuffix="gmb"
                />
              </div>
            </div>
          )}

          {!generateGmb.isPending && !result && (
            <div className="p-12 text-center text-muted-foreground">
              <p>Click "Generate Post" to create your update.</p>
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
