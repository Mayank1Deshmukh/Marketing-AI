import { useState } from "react";
import { useRegenerateSection } from "@workspace/api-client-react";
import type { RegenerateInputTrack, BusinessProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw } from "lucide-react";

interface EscapeValveProps {
  track: RegenerateInputTrack;
  originalPrompt: string;
  originalOutput: string;
  profile: BusinessProfile;
  onRegenerated: (newText: string) => void;
  testIdSuffix: string;
}

export function EscapeValve({ track, originalPrompt, originalOutput, profile, onRegenerated, testIdSuffix }: EscapeValveProps) {
  const [tweakModifier, setTweakModifier] = useState("");
  const regenerate = useRegenerateSection();

  const handleRegenerate = () => {
    if (!tweakModifier.trim()) return;
    
    regenerate.mutate({
      data: {
        track,
        originalPrompt,
        originalOutput,
        profile,
        tweakModifier
      }
    }, {
      onSuccess: (data) => {
        onRegenerated(data.output);
        setTweakModifier("");
      }
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center gap-3">
      <div className="flex-1 w-full">
        <Input 
          value={tweakModifier}
          onChange={(e) => setTweakModifier(e.target.value)}
          placeholder="Need a tweak? e.g. 'Make it punchier' or 'Focus on the croissants'"
          className="bg-background text-sm h-9"
          data-testid={`input-tweak-${testIdSuffix}`}
          onKeyDown={(e) => e.key === 'Enter' && handleRegenerate()}
        />
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRegenerate}
        disabled={regenerate.isPending || !tweakModifier.trim()}
        className="w-full sm:w-auto flex items-center gap-2 h-9"
        data-testid={`button-regenerate-${testIdSuffix}`}
      >
        <RefreshCcw className={`h-3.5 w-3.5 ${regenerate.isPending ? 'animate-spin' : ''}`} />
        Regenerate
      </Button>
    </div>
  );
}
