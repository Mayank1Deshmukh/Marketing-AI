import { useState } from "react";
import { History, Copy, Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { HistoryItem } from "@/hooks/useHistory";
import { Button } from "@/components/ui/button";

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const preview =
    item.output.length > 130
      ? item.output.slice(0, 130).trimEnd() + "…"
      : item.output;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border/40">
        <span className="text-xs text-muted-foreground font-medium">{timeAgo(item.timestamp)}</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0 hover:text-primary"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((e) => !e)}
            className="h-7 w-7 p-0 hover:text-primary"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {expanded ? item.output : preview}
        </p>
      </div>
    </div>
  );
}

export function HistoryPanel({
  items,
  onClear,
  label = "Recent Outputs",
}: {
  items: HistoryItem[];
  onClear: () => void;
  label?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {label} ({items.length}/{5})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <HistoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
