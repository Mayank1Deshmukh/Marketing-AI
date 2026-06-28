import { useState, useCallback } from "react";

export interface HistoryItem {
  id: string;
  timestamp: number;
  output: string;
  metadata?: Record<string, unknown>;
}

const MAX_ITEMS = 5;

function storageKey(track: string) {
  return `localbrand_history_${track}`;
}

function loadHistory(track: string): HistoryItem[] {
  try {
    const raw = localStorage.getItem(storageKey(track));
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(track: string, items: HistoryItem[]) {
  try {
    localStorage.setItem(storageKey(track), JSON.stringify(items));
  } catch {}
}

export function useHistory(track: "gmb" | "review" | "social") {
  const [items, setItems] = useState<HistoryItem[]>(() => loadHistory(track));

  const addItem = useCallback(
    (output: string, metadata?: Record<string, unknown>) => {
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        output,
        metadata,
      };
      setItems((prev) => {
        const next = [newItem, ...prev].slice(0, MAX_ITEMS);
        saveHistory(track, next);
        return next;
      });
    },
    [track],
  );

  const clearHistory = useCallback(() => {
    setItems([]);
    saveHistory(track, []);
  }, [track]);

  return { items, addItem, clearHistory };
}
