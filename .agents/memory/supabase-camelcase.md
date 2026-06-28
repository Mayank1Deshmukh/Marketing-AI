---
name: Supabase camelCase mapping
description: Supabase returns snake_case column names; the API client and marketing routes expect camelCase. Always transform before responding.
---

## Rule
Every profile response from Supabase must pass through `toProfile()` before being sent to the client. Skipping this causes marketing endpoint validation to fail with 400 because `profile.businessName` (etc.) will be `undefined`.

## Why
Supabase stores and returns columns as-is from the DB schema (`business_name`, `brand_voice`, `secret_sauce`). The generated API client types (`Profile`, `BusinessProfile`) use camelCase. The marketing routes destructure `profile.businessName`, `profile.offerings`, etc. If the raw Supabase object is forwarded, those fields are `undefined` and the server-side guard (`if (!profile?.businessName)`) rejects with 400.

## How to apply
In `artifacts/api-server/src/routes/profile.ts`, the `toProfile(row)` function handles the mapping. Call it on every `res.json(data)` where `data` is a raw Supabase row:
- `GET /profile/current` → `res.json(toProfile(data))`
- `GET /profile/:id` → `res.json(toProfile(data))`
- `POST /profile` → `res.status(201).json(toProfile(data))`

Any new profile-related endpoints must do the same.
