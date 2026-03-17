import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import https from 'https';
import http from 'http';
import dns from 'dns';

// Point Node's DNS resolver directly at Google + Cloudflare public DNS.
// This bypasses whatever broken/restricted system resolver is running locally.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
};

// Step 1: resolve the real IPv4 via Google DNS.
// Step 2: open a TCP connection to that IP directly, passing the hostname as the Host header.
// This completely decouples DNS lookup from the OS resolver.
async function httpGet(url, redirectsLeft = 5) {
    let parsed;
    try { parsed = new URL(url); } catch (e) { throw e; }

    // Resolve hostname → IPv4 address using the servers set above
    let ip;
    try {
        const result = await dns.promises.lookup(parsed.hostname, { family: 4 });
        ip = result.address;
    } catch (dnsErr) {
        const err = new Error(`DNS lookup failed for "${parsed.hostname}"`);
        err.code = 'ENOTFOUND';
        throw err;
    }

    return new Promise((resolve, reject) => {
        const isHttps = parsed.protocol === 'https:';
        const mod = isHttps ? https : http;
        const AgentClass = isHttps ? https.Agent : http.Agent;
        // rejectUnauthorized: false needed because we connect to the IP, not the hostname
        const agent = new AgentClass({ rejectUnauthorized: false });

        const port = parsed.port ? Number(parsed.port) : (isHttps ? 443 : 80);
        const path = (parsed.pathname || '/') + (parsed.search || '');

        const req = mod.request(
            {
                hostname: ip,           // connect to resolved IPv4 directly
                port,
                path,
                method: 'GET',
                headers: { ...FETCH_HEADERS, Host: parsed.hostname }, // tell the server its own name
                agent,
            },
            (res) => {
                // Follow redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
                    const loc = res.headers.location;
                    const nextUrl = loc.startsWith('http') ? loc : `${parsed.protocol}//${parsed.host}${loc}`;
                    res.resume();
                    return resolve(httpGet(nextUrl, redirectsLeft - 1));
                }
                let data = '';
                res.setEncoding('utf8');
                res.on('data', chunk => { data += chunk; });
                res.on('end', () => resolve({
                    ok: res.statusCode < 400,
                    status: res.statusCode,
                    finalUrl: url,
                    text: () => data,
                    headers: { get: k => res.headers[k.toLowerCase()] },
                }));
                res.on('error', reject);
            }
        );
        req.setTimeout(15000, () => { req.destroy(); reject(Object.assign(new Error('Timeout'), { name: 'TimeoutError' })); });
        req.on('error', reject);
        req.end();
    });
}


async function analyzeUrl(url) {
    const startTime = Date.now();

    // Validate and clean URL first
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error(`Invalid URL: "${url}" — please include https:// at the start.`);
    }

    const response = await httpGet(url).catch(err => {
        if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
            throw new Error(`Could not reach "${parsedUrl.hostname}" — the domain may not exist or DNS resolution failed. Please check the URL.`);
        }
        if (err.code === 'ECONNREFUSED') {
            throw new Error(`Connection refused by "${parsedUrl.hostname}".`);
        }
        if (err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
            throw new Error(`"${parsedUrl.hostname}" timed out — the site may be too slow or unavailable.`);
        }
        throw new Error(`Failed to fetch "${parsedUrl.hostname}": ${err.message}`);
    });
    const fetchTime = Date.now() - startTime;

    const html = response.text();
    const $ = cheerio.load(html);
    const finalUrl = response.finalUrl;
    const hostname = new URL(finalUrl).hostname.replace('www.', '');

    // ── Core signals ────────────────────────────────────────────────────────
    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = ($('meta[name="keywords"]').attr('content') || '').split(',').map(k => k.trim()).filter(Boolean);

    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
    const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';

    const h1s = $('h1').map((_, el) => $(el).text().trim()).get();
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 8);
    const h1Count = h1s.length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;

    const canonical = $('link[rel="canonical"]').attr('href') || null;
    const hasViewport = !!$('meta[name="viewport"]').attr('content');
    const isSecure = finalUrl.startsWith('https://');

    const allImages = $('img');
    const totalImages = allImages.length;
    const imagesWithoutAlt = allImages.filter((_, el) => !$(el).attr('alt')?.trim()).length;

    const hasFavicon = !!($('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href'));
    const hasRobotsTxt = await httpGet(`https://${hostname}/robots.txt`).then(r => r.ok).catch(() => false);
    const hasSitemapRef = html.toLowerCase().includes('sitemap');
    const hasSchema = html.toLowerCase().includes('application/ld+json');
    const hasCanonical = !!canonical;

    // Link analysis
    const internalLinks = $('a[href]').filter((_, el) => {
        const href = $(el).attr('href') || '';
        return href.startsWith('/') || href.includes(hostname);
    }).length;
    const externalLinks = $('a[href]').filter((_, el) => {
        const href = $(el).attr('href') || '';
        return href.startsWith('http') && !href.includes(hostname);
    }).length;

    // Word count estimate
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(' ').filter(w => w.length > 2).length;

    // ── SEO Score ────────────────────────────────────────────────────────────
    let score = 100;
    const issues = [];
    const strengths = [];

    // Title
    if (!title) { score -= 15; issues.push('Missing title tag'); }
    else if (title.length < 30 || title.length > 60) { score -= 8; issues.push(`Title length (${title.length} chars) not in 30–60 range`); }
    else strengths.push('Title tag is well-optimised');

    // Meta description
    if (!metaDesc) { score -= 10; issues.push('Missing meta description'); }
    else if (metaDesc.length < 100 || metaDesc.length > 160) { score -= 5; issues.push(`Meta description length (${metaDesc.length} chars) not in 100–160 range`); }
    else strengths.push('Meta description is well-optimised');

    // H1
    if (h1Count === 0) { score -= 10; issues.push('No H1 tag found'); }
    else if (h1Count > 1) { score -= 8; issues.push(`Multiple H1 tags (${h1Count}) found`); }
    else strengths.push('Single H1 tag — ideal structure');

    // Alt text
    if (imagesWithoutAlt > 0) { score -= Math.min(10, imagesWithoutAlt * 2); issues.push(`${imagesWithoutAlt} image(s) missing alt text`); }
    else if (totalImages > 0) strengths.push('All images have alt text');

    // Canonical
    if (!hasCanonical) { score -= 5; issues.push('No canonical tag found'); }
    else strengths.push('Canonical tag present');

    // Viewport / mobile
    if (!hasViewport) { score -= 10; issues.push('Missing viewport meta tag'); }
    else strengths.push('Mobile viewport configured');

    // HTTPS
    if (!isSecure) { score -= 10; issues.push('Site is not served over HTTPS'); }
    else strengths.push('Served securely over HTTPS');

    // OG tags
    if (!ogTitle && !ogDesc) { score -= 5; issues.push('Open Graph tags missing'); }
    else strengths.push('Open Graph meta tags configured');

    // Twitter card
    if (!twitterCard) { score -= 3; issues.push('Twitter Card meta missing'); }
    else strengths.push('Twitter Card meta configured');

    // Schema
    if (!hasSchema) { score -= 5; issues.push('No JSON-LD schema markup detected'); }
    else strengths.push('Structured data (JSON-LD schema) present');

    // Robots
    if (!hasRobotsTxt) { score -= 5; issues.push('robots.txt not found'); }
    else strengths.push('robots.txt is accessible');

    // Favicon
    if (!hasFavicon) { score -= 2; issues.push('No favicon found'); }

    score = Math.max(0, Math.min(100, score));

    return {
        url: finalUrl,
        hostname,
        score,
        fetchTime,
        title,
        metaDesc,
        metaKeywords,
        ogTitle,
        ogDesc,
        ogImage,
        twitterCard,
        twitterTitle,
        twitterImage,
        h1s,
        h2s,
        h1Count,
        h2Count,
        h3Count,
        canonical,
        hasViewport,
        isSecure,
        totalImages,
        imagesWithoutAlt,
        hasFavicon,
        hasRobotsTxt,
        hasSitemapRef,
        hasSchema,
        hasCanonical,
        internalLinks,
        externalLinks,
        wordCount,
        issues,
        strengths,
    };
}

export async function POST(req) {
    try {
        const { urlA, urlB } = await req.json();

        if (!urlA || !urlB) {
            return NextResponse.json({ error: 'Both URLs are required.' }, { status: 400 });
        }

        const normalise = (u) => u.startsWith('http') ? u : `https://${u}`;

        const [siteA, siteB] = await Promise.all([
            analyzeUrl(normalise(urlA)),
            analyzeUrl(normalise(urlB)),
        ]);

        // ── AI-generated narrative summary ──────────────────────────────────
        let aiSummary = null;
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'your_api_key_here') {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash',
                    generationConfig: { responseMimeType: 'application/json' }
                });

                const prompt = `
You are an expert SEO analyst. Compare these two websites and return a JSON object explaining the gap analysis.

SITE A: ${siteA.hostname}
- SEO Score: ${siteA.score}/100
- Title: "${siteA.title}"
- Meta Description: "${siteA.metaDesc}"
- H1 count: ${siteA.h1Count}, H2 count: ${siteA.h2Count}
- Images without alt: ${siteA.imagesWithoutAlt}/${siteA.totalImages}
- Has Schema: ${siteA.hasSchema}, Has OG: ${!!siteA.ogTitle}, HTTPS: ${siteA.isSecure}
- Word count: ${siteA.wordCount}, Internal links: ${siteA.internalLinks}
- Top issues: ${siteA.issues.join(', ') || 'none'}

SITE B: ${siteB.hostname}
- SEO Score: ${siteB.score}/100
- Title: "${siteB.title}"
- Meta Description: "${siteB.metaDesc}"
- H1 count: ${siteB.h1Count}, H2 count: ${siteB.h2Count}
- Images without alt: ${siteB.imagesWithoutAlt}/${siteB.totalImages}
- Has Schema: ${siteB.hasSchema}, Has OG: ${!!siteB.ogTitle}, HTTPS: ${siteB.isSecure}
- Word count: ${siteB.wordCount}, Internal links: ${siteB.internalLinks}
- Top issues: ${siteB.issues.join(', ') || 'none'}

Return ONLY raw JSON matching this exact schema:
{
  "winner": "A" or "B" (which site has stronger SEO overall),
  "winnerHostname": "the winning domain",
  "loserHostname": "the losing domain",
  "overallSummary": "2-3 sentence executive summary of the SEO gap between the two sites",
  "whyWinnerRanksHigher": ["reason 1", "reason 2", "reason 3"],
  "topOpportunitiesForLoser": ["actionable fix 1", "actionable fix 2", "actionable fix 3"],
  "keyDifferences": [
    { "metric": "metric name", "siteA": "value for siteA", "siteB": "value for siteB", "winner": "A" or "B" or "tie" }
  ]
}
`.trim();

                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();
                const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
                aiSummary = JSON.parse(clean);
            } catch (e) {
                console.error('Gap analysis AI error:', e.message);
                aiSummary = null;
            }
        }

        return NextResponse.json({ siteA, siteB, aiSummary });

    } catch (error) {
        console.error('Gap analysis error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error during gap analysis' }, { status: 500 });
    }
}
