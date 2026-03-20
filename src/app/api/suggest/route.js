import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory cache — avoids re-hitting the API for the same page within 10 min
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, score, title, metaDesc, keywords, h1Count, hasViewport, isSecure, imagesWithoutAlt } = body;

    // Cache key based on what actually affects the suggestions
    const cacheKey = `${url}::${score}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log('SEO Copilot: cache hit for', url);
      return NextResponse.json(cached.data);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash as a newer model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });


    const prompt = `
You are a senior SEO strategist. You are given a website's current SEO data below. 
Your job is to return a structured JSON object with precise, actionable improvements.

CURRENT WEBSITE DATA:
- URL: ${url}
- SEO Score: ${score}/100
- Current Title Tag: "${title || 'MISSING'}"
- Current Meta Description: "${metaDesc || 'MISSING'}"
- Top Keywords Found: ${keywords?.join(', ') || 'none'}
- H1 Count: ${h1Count} (should be exactly 1)
- Mobile Viewport: ${hasViewport ? 'present' : 'MISSING'}
- HTTPS: ${isSecure ? 'secure' : 'INSECURE'}
- Images Missing Alt Text: ${imagesWithoutAlt}

INSTRUCTIONS:
Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation. Just raw JSON.
The JSON must follow this exact structure:

{
  "improvedTitle": "A new optimized title tag between 50-60 characters, keyword-rich",
  "improvedMeta": "A new optimized meta description between 120-160 characters, includes a CTA",
  "contentSuggestions": [
    "Specific actionable suggestion 1",
    "Specific actionable suggestion 2",
    "Specific actionable suggestion 3"
  ],
  "keywordTargets": [
    { "keyword": "example keyword", "reason": "why this keyword should be targeted" },
    { "keyword": "another keyword", "reason": "why this matters" },
    { "keyword": "third keyword", "reason": "context" }
  ],
  "quickWins": [
    "One-line quick fix that would immediately improve the score"
  ],
  "headlineIdeas": [
    "H1 headline idea 1 for the page",
    "H1 headline idea 2 for the page"
  ]
}

Be specific to this website's industry and content. Don't be generic. Make suggestions based on the actual data.

Also include these impact estimates for the SEO Diff simulator (add them to the same JSON object):
- "currentTitleCTR": number (1 decimal), estimated organic CTR % for the CURRENT title
- "suggestedTitleCTR": number (1 decimal), estimated organic CTR % for your IMPROVED title
- "currentMetaCTR": number (1 decimal), estimated CTR contribution % of the CURRENT meta description
- "suggestedMetaCTR": number (1 decimal), estimated CTR contribution % of your IMPROVED meta description
- "scoreDelta": integer, how many SEO score points would likely improve if all suggestions are applied (realistic, 0-25)
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if the model wraps its response
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: 'AI returned an invalid format. Please try again.' }, { status: 500 });
    }

    // Store in cache for 10 minutes
    cache.set(cacheKey, { data: parsed, timestamp: Date.now() });

    return NextResponse.json(parsed);

  } catch (err) {
    console.error('SEO Copilot error:', err);

    if (err.message?.includes('429')) {
      return NextResponse.json({
        error: "Rate limit reached on the free tier (15 req/min). Wait 60 seconds and try again — your next request will be cached for 10 minutes."
      }, { status: 429 });
    }

    return NextResponse.json({ error: err.message || 'Internal error in SEO Copilot' }, { status: 500 });
  }
}
