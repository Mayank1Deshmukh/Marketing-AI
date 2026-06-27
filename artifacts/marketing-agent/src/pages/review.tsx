import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGenerateReviewResponse } from "@workspace/api-client-react";
import { Star, MessageSquareQuote } from "lucide-react";
import { getProfile, BusinessProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { EscapeValve } from "@/components/escape-valve";

export function ReviewTrack() {
  const [_, setLocation] = useLocation();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [reviewText, setReviewText] = useState("");
  
  const generateResponse = useGenerateReviewResponse();
  const [result, setResult] = useState<{
    sentiment?: string | null;
    highlights: string[];
    response: string;
  } | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      setLocation("/");
    } else {
      setProfile(p);
    }
  }, [setLocation]);

  if (!profile) return null;

  const handleGenerate = () => {
    generateResponse.mutate(
      { data: { profile, reviewText: reviewText.trim() || undefined } },
      {
        onSuccess: (data) => {
          setResult(data);
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-primary">Smart Review Responder</h1>
        <p className="text-muted-foreground">Draft professional, brand-aligned replies to customer reviews in seconds.</p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-card">
          <label className="block text-sm font-medium mb-2">Customer Review Text (Optional)</label>
          <Textarea 
            placeholder="Paste the customer's review here to get a specific response..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-[100px] resize-y mb-4"
            data-testid="input-review-text"
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Voice: <span className="font-medium text-foreground capitalize">{profile.brandVoice}</span></div>
            <Button 
              onClick={handleGenerate} 
              disabled={generateResponse.isPending}
              data-testid="button-generate-review"
            >
              {generateResponse.isPending ? "Drafting..." : "Draft Reply"}
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {generateResponse.isPending && (
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

          {!generateResponse.isPending && result && (
            <div className="divide-y border-border/50">
              <div className="p-6 bg-slate-50 dark:bg-slate-900/20">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4" /> Stage 1: Review Analysis
                </h3>
                {result.sentiment && (
                  <p className="text-sm font-medium mb-3">
                    Detected Sentiment: <span className="text-primary">{result.sentiment}</span>
                  </p>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Key Highlights:</p>
                  <ul className="space-y-1">
                    {result.highlights.map((h, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Final Output: Your Reply</h3>
                  <CopyButton text={result.response} testId="button-copy-review" />
                </div>
                <div className="whitespace-pre-wrap text-base leading-relaxed bg-white dark:bg-black/10 p-5 rounded-lg border border-border shadow-sm">
                  {result.response}
                </div>
                
                <EscapeValve 
                  track="review"
                  originalPrompt="Draft review response based on analysis"
                  originalOutput={result.response}
                  profile={profile}
                  onRegenerated={(newText) => setResult({ ...result, response: newText })}
                  testIdSuffix="review"
                />
              </div>
            </div>
          )}

          {!generateResponse.isPending && !result && (
            <div className="p-12 text-center text-muted-foreground">
              <p>Click "Draft Reply" to analyze and generate a response.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
