export interface BusinessProfile {
  businessName: string;
  city: string;
  neighborhoods: string;
  landmarks?: string;
  offerings: string;
  brandVoice: "friendly" | "professional" | "playful" | "nononsense";
  secretSauce: string;
}

const VOICE_DESCRIPTIONS: Record<string, string> = {
  friendly: "warm, conversational, and approachable — like talking to a neighbor",
  professional: "polished, authoritative, and trustworthy — confident and clear",
  playful: "fun, witty, and lighthearted — uses wordplay and personality",
  nononsense: "direct, factual, and straightforward — no fluff or filler",
};

export function profileSummary(p: BusinessProfile): string {
  return `
Business Name: ${p.businessName}
Location: ${p.city}
Neighborhoods Served: ${p.neighborhoods}
${p.landmarks ? `Local Landmarks/Anchors: ${p.landmarks}` : ""}
Core Offerings: ${p.offerings}
Brand Voice: ${p.brandVoice} — ${VOICE_DESCRIPTIONS[p.brandVoice] ?? p.brandVoice}
Secret Sauce: ${p.secretSauce}
`.trim();
}

// ─── Track A: GMB ────────────────────────────────────────────────────────────

export function gmbStage1Prompt(p: BusinessProfile): string {
  return `You are a local SEO expert helping a small business rank better on Google Maps.

${profileSummary(p)}

Your task: Identify 2–3 specific, hyper-local SEO keyword concepts this business should target in their Google Business Profile posts. Focus on neighborhood-level proximity terms, not generic category keywords.

Output ONLY a JSON array of strings. No explanation. Example:
["East Austin sourdough bakery", "fresh bread near Plaza Saltillo", "artisan bakery Chicon Street"]`;
}

export function gmbStage2Prompt(p: BusinessProfile, concepts: string[]): string {
  return `You are a local marketing copywriter. Write a Google Business Profile post for a local business.

${profileSummary(p)}

Local SEO concepts to weave in naturally: ${concepts.join(", ")}

Requirements:
- 100–150 words maximum
- Keyword-dense but reads naturally
- End with a clear local Call To Action (e.g., "Come visit us on Chicon St!", "Call now to order!", or "Get directions on Google Maps")
- Match the brand voice exactly
- Never invent landmarks or cross-streets not provided above

Output ONLY the post text. No explanation, no quotes.`;
}

// ─── Track B: Review Responder ────────────────────────────────────────────────

export function reviewStage1Prompt(reviewText: string): string {
  return `You are a sentiment analyst for a local business. Analyze this customer review and extract key points.

Review text:
"${reviewText}"

Respond ONLY with a JSON object in this exact format:
{
  "sentiment": "positive" | "negative" | "mixed",
  "highlights": ["specific item or point mentioned 1", "specific item or point mentioned 2"]
}

highlights must be concrete and specific (e.g., "blueberry muffins", "long wait time", "friendly staff") — not generic.`;
}

export function reviewStage2Prompt(
  p: BusinessProfile,
  reviewText: string | null,
  sentiment: string | null,
  highlights: string[],
): string {
  const hasReview = reviewText && reviewText.trim().length > 0;

  if (hasReview && highlights.length > 0) {
    return `You are writing a customer review response for ${p.businessName}.

${profileSummary(p)}

Original review: "${reviewText}"
Sentiment: ${sentiment}
Key points from the review: ${highlights.join(", ")}

Write a response that:
- Directly addresses each key point (${highlights.join(", ")})
- Matches the brand voice exactly
- Is genuine, specific, and not generic
- Is 60–100 words
- Does NOT use phrases like "we value your feedback" or "we're sorry to hear that" — be specific and human

Output ONLY the response text. No explanation, no quotes.`;
  }

  // Fallback path — no review text provided
  return `You are writing a template review response for ${p.businessName}.

${profileSummary(p)}

No specific review text was provided, so write a warm, generic-but-specific response template that:
- Reflects the business category and core offerings (${p.offerings})
- Incorporates the Secret Sauce: "${p.secretSauce}"
- Matches the brand voice exactly
- Is 60–100 words
- Feels specific to THIS business, not a generic plumbing company or restaurant
- Does NOT use hollow phrases like "we value your feedback"

Output ONLY the response text. No explanation, no quotes.`;
}

// ─── Track C: Hyper-Local Social Ad ──────────────────────────────────────────

export function socialStage1Prompt(p: BusinessProfile, platform: string): string {
  return `You are a local advertising strategist. Build a proximity copywriting framework for a ${platform} ad.

${profileSummary(p)}

STRICT RULE: Only use geographic details EXPLICITLY provided above. Do NOT invent cross-streets, parks, neighborhoods, or landmarks that are not in the profile.

Create a structured proximity framework that identifies:
1. The primary geographic hook (neighborhood/city)
2. Any specific physical anchor from the profile (or note "none provided")
3. The emotional pull for locals (why people nearby should care)
4. The urgency or local exclusivity angle

Output ONLY a JSON object:
{
  "primaryGeoHook": "...",
  "physicalAnchor": "...",
  "emotionalPull": "...",
  "localUrgency": "..."
}`;
}

export function socialStage2InstagramPrompt(
  p: BusinessProfile,
  framework: { primaryGeoHook: string; physicalAnchor: string; emotionalPull: string; localUrgency: string },
): string {
  return `Write an Instagram caption for a local business.

${profileSummary(p)}

Proximity framework to use:
- Primary geo hook: ${framework.primaryGeoHook}
- Physical anchor: ${framework.physicalAnchor}
- Emotional pull: ${framework.emotionalPull}
- Local urgency: ${framework.localUrgency}

Requirements:
- 80–120 words
- Conversational Instagram voice layered with the brand voice
- End with 4–6 relevant hashtags (mix of neighborhood-level and category-level)
- STRICT: Only use geographic details explicitly in the profile above

Output ONLY a JSON object:
{
  "caption": "...",
  "hashtags": ["hashtag1", "hashtag2", ...]
}`;
}

export function socialStage2AdPrompt(
  p: BusinessProfile,
  platform: string,
  framework: { primaryGeoHook: string; physicalAnchor: string; emotionalPull: string; localUrgency: string },
): string {
  return `Write a ${platform} ad copy for a local business targeting people within 5 miles.

${profileSummary(p)}

Proximity framework to use:
- Primary geo hook: ${framework.primaryGeoHook}
- Physical anchor: ${framework.physicalAnchor}
- Emotional pull: ${framework.emotionalPull}
- Local urgency: ${framework.localUrgency}

Requirements:
- 80–120 words
- Conversational, neighbor-to-neighbor tone layered with brand voice
- Start with a location-based hook (e.g., "Hey East Austin neighbors!" or "Attention [neighborhood] locals!")
- Include a clear call to action
- STRICT: Only use geographic details explicitly in the profile above

Output ONLY the ad copy text. No explanation, no quotes.`;
}

// ─── Escape Valve: Regenerate ─────────────────────────────────────────────────

export function regeneratePrompt(
  track: string,
  originalPrompt: string,
  originalOutput: string,
  tweakModifier: string,
): string {
  return `You are rewriting a piece of marketing copy based on user feedback.

Track: ${track.toUpperCase()}
Original prompt context: ${originalPrompt}

Original output:
"${originalOutput}"

User's requested change: "${tweakModifier}"

Rewrite the copy applying the user's requested change while keeping the same core message, brand voice, and local specificity. Output ONLY the rewritten text. No explanation, no quotes.`;
}
