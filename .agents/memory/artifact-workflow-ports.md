---
name: Artifact Workflow Port Conflicts
description: Manual workflows conflict with artifact-managed workflows when they share ports.
---

**Problem:** When you create manual workflows (via configureWorkflow) that bind to the same ports as artifact-managed workflows, the artifact workflows fail with EADDRINUSE on restart.

**Fix:** Always use artifact-managed workflows exclusively. If manual workflows were created before artifacts were registered, remove them with removeWorkflow() before restarting artifact workflows.

**Why:** The Replit artifact system creates its own workflows per service. Running both simultaneously causes port contention.
**How to apply:** After registering artifacts, check for stale manual workflows and remove them.
