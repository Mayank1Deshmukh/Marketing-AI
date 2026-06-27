---
name: Supabase Node20 Fix
description: Supabase Realtime client crashes on Node.js 20 without a ws package.
---

**Problem:** `@supabase/supabase-js` v2 Realtime client throws at startup on Node <22 because native WebSocket isn't available.

**Fix:** Install `ws` and `@types/ws`, then pass it as transport:
```typescript
import ws from "ws";
export const supabase = createClient(url, key, {
  realtime: { transport: ws },
});
```

**Why:** Node 22 added native WebSocket; Node 20 does not have it. Supabase Realtime requires one.
