---
name: API server rebuild required
description: The Express API server only compiles on workflow start; backend changes need a workflow restart to take effect.
---

## Rule
After editing any file under `artifacts/api-server/src/`, always restart the `artifacts/api-server: API Server` workflow so the new code gets compiled into `dist/`. Changes are NOT picked up automatically (no watch mode).

## Why
The dev script is `pnpm run build && pnpm run start` — it builds once at startup then serves the compiled bundle. There is no file-watcher or hot-reload on the server side.

## How to apply
Use `restart_workflow` with name `artifacts/api-server: API Server` after any backend file edit. Confirm the new process ID appears in the logs (different from the previous one) before testing.
