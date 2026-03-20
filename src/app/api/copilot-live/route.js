import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const body = await req.json();
    const { content, keyword, title } = body;

    if (!content || content.trim().length < 30) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
You are a real-time SEO editor assistant. Analyze the content below and return concise, actionable SEO suggestions.

Target Keyword: "${keyword || 'not specified'}"
Page Title: "${title || 'not specified'}"

CONTENT:
"""
${content.substring(0, 3000)}
"""

Return ONLY a valid JSON object. No markdown, no backticks.

{
  "suggestions": [
    {
      "type": "warning" | "tip" | "error",
      "category": "Keyword" | "Structure" | "Readability" | "Links" | "Meta" | "Engagement",
      "message": "Short, specific feedback (max 12 words)",
      "detail": "One sentence explaining why this matters for SEO"
    }
  ],
  "keywordDensity": number (percentage, 1 decimal),
  "readabilityScore": number (0-100, Flesch-Kincaid style estimate),
  "wordCount": number
}

Rules:
- Return 3-6 suggestions maximum. Quality over quantity.
- Be specific to the actual content — not generic advice.
- If keyword is "not specified", skip keyword-related checks.
- Focus on high-impact issues only.
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 });
    }

    return NextResponse.json(parsed);

  } catch (err) {
    console.error('Live Copilot error:', err);
    if (err.message?.includes('429')) {
      return NextResponse.json({ error: 'Rate limit hit. Slow down slightly.' }, { status: 429 });
    }
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
