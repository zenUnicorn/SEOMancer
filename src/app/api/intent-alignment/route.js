import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory cache to avoid redundant API hits
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, title, keywords, contentSnapshot } = body;

    if (!url || !contentSnapshot) {
      return NextResponse.json({ error: 'URL and Content are required for Intent Analysis' }, { status: 400 });
    }

    const cacheKey = `${url}::intent`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
You are an elite Search Intent & Ranking Psychology Specialist. 
Your goal is to perform a deep semantic analysis of the provided web page and score its structural search intent alignment. 
Often, a page tries to rank for a commercial term, but provides 80% informational content, so it will never rank. 
Analyze the provided metadata and body copy subset to detect:
1. What the TARGET intent of this page is (e.g., Navigational, Informational, Commercial, or Transactional). Based on title & keywords.
2. What the ACTUAL content focus of the page is, based on the body text provided. 
3. How well aligned these two are (0 to 100 score).
4. A punchy verdict (max 2 sentences) that explains the disconnect or the success, similar to: "Your page targets 'best CRM tools' (commercial intent), but your content is 80% informational. You’re unlikely to rank."

CURRENT WEBSITE DATA:
- URL: ${url}
- Title Tag: "${title || 'MISSING'}"
- Top Keywords: ${keywords?.join(', ') || 'none'}
- Content Snippet:
"""
${contentSnapshot}
"""

INSTRUCTIONS:
Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation. Just raw JSON.
The JSON must follow this precise structure:
{
  "targetIntent": "string (Informational | Commercial | Transactional | Navigational)",
  "actualContentFocus": "string (Informational | Commercial | Transactional | Navigational)",
  "alignmentScore": number (0-100),
  "verdict": "string"
}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: 'AI returned an invalid format for intent.' }, { status: 500 });
    }

    cache.set(cacheKey, { data: parsed, timestamp: Date.now() });

    return NextResponse.json(parsed);

  } catch (err) {
    console.error('Intent Alignment error:', err);

    if (err.message?.includes('429')) {
      return NextResponse.json({
        error: "Rate limit reached. Wait 60 seconds."
      }, { status: 429 });
    }

    return NextResponse.json({ error: err.message || 'Internal error in Intent Alignment' }, { status: 500 });
  }
}
