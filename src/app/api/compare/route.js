import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Extended English stop words list
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'shall', 'can', 'need', 'dare', 'ought', 'used', 'this', 'that', 'these', 'those',
    'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your', 'he', 'she',
    'his', 'her', 'i', 'me', 'my', 'who', 'which', 'what', 'when', 'where', 'how',
    'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'more', 'most',
    'about', 'above', 'after', 'before', 'between', 'over', 'under', 'into',
    'through', 'during', 'then', 'than', 'too', 'very', 'just', 'also', 'here',
    'there', 'now', 'only', 'such', 'while', 'although', 'because', 'if', 'as',
    'all', 'any', 'each', 'every', 'other', 'some', 'same', 'own', 'page', 'site',
    'click', 'read', 'learn', 'more', 'get', 'use', 'make', 'see', 'know', 'look',
    'go', 'come', 'take', 'give', 'find', 'think', 'help', 'say', 'tell', 'show',
    'us', 've', 're', 'll', 'don', 't', 's', 'www', 'http', 'https', 'com', 'org', 'net'
]);

/**
 * Extracts and cleans visible text from raw HTML.
 */
function extractText(html) {
    const $ = cheerio.load(html);
    // Remove script and style tags
    $('script, style, noscript, head, nav, footer').remove();
    return $('body').text().replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * TF-IDF Lite: Scores a word by its frequency / total words (term density).
 * Returns top N unique meaningful keywords with their density scores.
 */
function getTopKeywords(text, topN = 10) {
    const words = text.match(/[a-z]{4,}/g) || [];
    const totalWords = words.length || 1;

    const freq = {};
    for (const word of words) {
        if (!STOP_WORDS.has(word)) {
            freq[word] = (freq[word] || 0) + 1;
        }
    }

    return Object.entries(freq)
        .map(([word, count]) => ({
            word,
            count,
            density: parseFloat(((count / totalWords) * 100).toFixed(2))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
}

/**
 * Core gap analysis: finds words competitor ranks highly for that user is missing.
 */
function compareKeywords(userText, competitorText) {
    const userKeywords = getTopKeywords(userText, 10);
    const competitorKeywords = getTopKeywords(competitorText, 10);

    const userWordSet = new Set(userKeywords.map(k => k.word));
    const top5User = userKeywords.slice(0, 5);
    const top5Competitor = competitorKeywords.slice(0, 5);

    // Words in competitor's top 10 that user doesn't have in their top 10
    const suggestedGaps = competitorKeywords.filter(k => !userWordSet.has(k.word));

    return {
        userKeywords: top5User,
        competitorKeywords: top5Competitor,
        suggestedGaps: suggestedGaps.slice(0, 5)
    };
}

/**
 * Fetches a URL and returns its HTML text.
 */
async function fetchHtml(url) {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOMancer/1.0)' },
        signal: AbortSignal.timeout(10000),
    });
    return res.text();
}

export async function POST(req) {
    try {
        const body = await req.json();
        let { userUrl, competitorUrl } = body;

        if (!userUrl || !competitorUrl) {
            return NextResponse.json({ error: 'Both userUrl and competitorUrl are required.' }, { status: 400 });
        }

        if (!userUrl.startsWith('http')) userUrl = 'https://' + userUrl;
        if (!competitorUrl.startsWith('http')) competitorUrl = 'https://' + competitorUrl;

        // Fetch both sites in parallel
        let userHtml, competitorHtml;
        try {
            [userHtml, competitorHtml] = await Promise.all([
                fetchHtml(userUrl),
                fetchHtml(competitorUrl),
            ]);
        } catch (err) {
            return NextResponse.json({ error: 'Failed to fetch one or both URLs. Please verify they are correct.' }, { status: 400 });
        }

        const userText = extractText(userHtml);
        const competitorText = extractText(competitorHtml);

        const { userKeywords, competitorKeywords, suggestedGaps } = compareKeywords(userText, competitorText);

        return NextResponse.json({
            userHost: new URL(userUrl).hostname.replace('www.', ''),
            competitorHost: new URL(competitorUrl).hostname.replace('www.', ''),
            userKeywords,
            competitorKeywords,
            suggestedGaps,
        });

    } catch (err) {
        console.error('Compare error:', err);
        return NextResponse.json({ error: 'Internal server error during comparison.' }, { status: 500 });
    }
}
