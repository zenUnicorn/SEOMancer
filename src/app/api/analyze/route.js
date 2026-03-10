import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import https from 'https';
import http from 'http';
import dns from 'dns';

// Use Google + Cloudflare DNS — bypasses broken/restricted system resolver
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const AGENT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; SEOMancer/1.0)',
    'Accept': 'text/html,application/xhtml+xml',
    'Cache-Control': 'no-cache',
};

async function httpGet(url, timeoutMs = 10000, redirectsLeft = 5) {
    let parsed;
    try { parsed = new URL(url); } catch (e) { throw e; }

    let ip;
    try {
        const r = await dns.promises.lookup(parsed.hostname, { family: 4 });
        ip = r.address;
    } catch {
        const e = new Error(`DNS failed for ${parsed.hostname}`); e.code = 'ENOTFOUND'; throw e;
    }

    return new Promise((resolve, reject) => {
        const isHttps = parsed.protocol === 'https:';
        const mod = isHttps ? https : http;
        const agent = new (isHttps ? https.Agent : http.Agent)({ rejectUnauthorized: false });
        const port = parsed.port ? Number(parsed.port) : (isHttps ? 443 : 80);
        const path = (parsed.pathname || '/') + (parsed.search || '');

        const req = mod.request(
            { hostname: ip, port, path, method: 'GET', headers: { ...AGENT_HEADERS, Host: parsed.hostname }, agent },
            (res) => {
                if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
                    const loc = res.headers.location;
                    const next = loc.startsWith('http') ? loc : `${parsed.protocol}//${parsed.host}${loc}`;
                    res.resume();
                    return resolve(httpGet(next, timeoutMs, redirectsLeft - 1));
                }
                let data = ''; res.setEncoding('utf8');
                res.on('data', c => { data += c; });
                res.on('end', () => resolve({
                    ok: res.statusCode < 400,
                    status: res.statusCode,
                    url: url,
                    text: () => Promise.resolve(data),
                    headers: { get: k => res.headers[k.toLowerCase()] },
                }));
                res.on('error', reject);
            }
        );
        req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('Timeout')); });
        req.on('error', reject);
        req.end();
    });
}

export async function POST(req) {
    try {
        const body = await req.json();
        let { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        const startTime = Date.now();

        // Fetch HTML
        let response;
        try {
            response = await httpGet(url, 15000);
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch the URL. Please check if it is correct.' }, { status: 400 });
        }

        const fetchTime = Date.now() - startTime;

        // Detect if the site blocks iframes (X-Frame-Options or CSP frame-ancestors)
        const xfo = (response.headers.get('x-frame-options') || '').toUpperCase();
        const cspHeader = response.headers.get('content-security-policy') || '';
        const iframeBlocked =
            xfo === 'DENY' ||
            xfo === 'SAMEORIGIN' ||
            (cspHeader.toLowerCase().includes('frame-ancestors') && !cspHeader.toLowerCase().includes('frame-ancestors *'));
        const screenshotUrl = `https://image.thum.io/get/width/1280/crop/900/noanimate/${encodeURIComponent(url)}`;
        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. SSL/HTTPS Check
        const isSecure = url.startsWith('https://');

        // 2. Title Tag
        const title = $('title').text() || '';
        const titleLength = title.length;
        const hasValidTitle = titleLength >= 50 && titleLength <= 60;

        // 3. Meta Description
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const descLength = metaDescription.length;
        const hasValidMetaDesc = descLength >= 120 && descLength <= 160;

        // 4. Canonical URL
        const canonicalURL = $('link[rel="canonical"]').attr('href') || null;
        const hasCanonical = !!canonicalURL;

        // 5. Favicon
        let hasFavicon = false;
        $('link[rel*="icon"]').each((_, el) => {
            if ($(el).attr('href')) hasFavicon = true;
        });

        // 6. H1 Tag
        const h1Count = $('h1').length;
        const hasOneH1 = h1Count === 1;

        // 7. Header Nesting
        let headerNestingLogical = true;
        let prevHeaderLevel = 0;
        $('h1, h2, h3, h4, h5, h6').each((_, el) => {
            const level = parseInt(el.tagName.substring(1), 10);
            if (prevHeaderLevel > 0 && level - prevHeaderLevel > 1) {
                // jump from h2 to h4 for example
                headerNestingLogical = false;
            }
            prevHeaderLevel = level;
        });

        // 8. Image Alt Text
        let imagesWithoutAlt = 0;
        const totalImages = $('img').length;
        $('img').each((_, el) => {
            const alt = $(el).attr('alt');
            if (alt === undefined || alt.trim() === '') {
                imagesWithoutAlt++;
            }
        });
        const allImagesHaveAlt = totalImages === 0 || imagesWithoutAlt === 0;

        // 9. Mobile Responsiveness
        const hasViewport = !!$('meta[name="viewport"]').attr('content');

        // 10. Robots.txt and Sitemap
        let baseUrl;
        let hasRobotsTxt = false;
        let hasSitemapRef = false;

        try {
            baseUrl = new URL(url).origin;
            const robotsRes = await httpGet(`${baseUrl}/robots.txt`, 5000);
            if (robotsRes.ok) {
                hasRobotsTxt = true;
                const robotsText = await robotsRes.text();
                if (robotsText.toLowerCase().includes('sitemap:')) {
                    hasSitemapRef = true;
                }
            }
        } catch (e) { /* ignore */ }

        let score = 100;

        const deductions = {
            title: hasValidTitle ? 0 : 10,
            metaDesc: hasValidMetaDesc ? 0 : 10,
            canonical: hasCanonical ? 0 : 5,
            favicon: hasFavicon ? 0 : 5,
            h1: hasOneH1 ? 0 : 10,
            headerNesting: headerNestingLogical ? 0 : 5,
            imagesAlt: allImagesHaveAlt ? 0 : 10,
            https: isSecure ? 0 : 15,
            mobile: hasViewport ? 0 : 15,
            robots: hasRobotsTxt ? 0 : 5,
            speed: fetchTime > 2000 ? 5 : 0
        };

        score = Math.max(0, Object.values(deductions).reduce((acc, curr) => acc - curr, score));

        const keywordsContent = $('meta[name="keywords"]').attr('content') || '';
        let originalKeywords = keywordsContent.split(',').map(k => k.trim()).filter(Boolean);

        // ── Rich multi-signal keyword extraction (handles modern sites with no meta keywords) ──
        // Pull from OG tags, Twitter cards, description, headings etc.
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        const ogDesc = $('meta[property="og:description"]').attr('content') || '';
        const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
        const twitterDesc = $('meta[name="twitter:description"]').attr('content') || '';

        // Gather words from headings — these are the signals Google actually cares about
        const h1Texts = $('h1').map((_, el) => $(el).text().trim()).get().join(' ');
        const h2Texts = $('h2').map((_, el) => $(el).text().trim()).get().filter((_, i) => i < 6).join(' ');

        // Tokenise all rich text signals into a keyword candidate pool
        const richSignals = [ogTitle, ogDesc, twitterTitle, twitterDesc, h1Texts, h2Texts, metaDescription, title]
            .join(' ')
            .replace(/[^a-zA-Z\s-]/g, ' ')
            .split(/\s+/)
            .map(w => w.toLowerCase().replace(/^-+|-+$/g, ''))
            .filter(w => w.length > 3);

        const kStopWords = new Set([
            'this', 'that', 'with', 'your', 'from', 'have', 'will', 'more', 'been',
            'they', 'what', 'also', 'into', 'over', 'when', 'just', 'like', 'some',
            'than', 'then', 'very', 'even', 'most', 'such', 'only', 'both', 'here',
            'make', 'take', 'need', 'help', 'find', 'know', 'back', 'time', 'good',
        ]);

        const richCounts = {};
        richSignals.forEach(w => {
            if (!kStopWords.has(w) && !originalKeywords.map(k => k.toLowerCase()).includes(w)) {
                richCounts[w] = (richCounts[w] || 0) + 1;
            }
        });

        // Merge meta keywords (if any) + rich candidates, prioritise meta keywords
        const richCandidates = Object.entries(richCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([w]) => w);

        // foundKeywords = explicitly declared meta keywords, no fallback
        let foundKeywords = [...new Set(originalKeywords.map(k => k.toLowerCase()))].map(word => ({
            word,
            reason: 'Found in the page\'s keywords meta tag'
        }));

        // If meta keywords are empty, pull from rich signals (OG/headings) as found keywords
        if (foundKeywords.length === 0 && richCandidates.length > 0) {
            foundKeywords = richCandidates.slice(0, 8).map(word => ({
                word,
                reason: 'Extracted from page headings and OG meta tags'
            }));
        }

        // Always create suggested keywords from body text to improve upon found ones
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
        const words = bodyText.split(/[\s,.-]+/).filter(w => w.length > 4);
        const wordCounts = {};
        const stopWords = ['these', 'those', 'there', 'their', 'about', 'which', 'would', 'could', 'should', 'other', 'another', 'first', 'second', 'using'];

        words.forEach(w => {
            const lw = w.toLowerCase();
            if (!stopWords.includes(lw) && !foundKeywords.some(f => f.word === lw)) {
                wordCounts[lw] = (wordCounts[lw] || 0) + 1;
            }
        });

        const highRankingThemes = ["software", "marketing", "business", "seo", "optimization", "performance", "digital", "agency", "tech", "platform", "solution"];

        let suggestedKeywords = Object.entries(wordCounts)
            .sort((a, b) => {
                const aHighRanking = highRankingThemes.includes(a[0]) ? 100 : 0;
                const bHighRanking = highRankingThemes.includes(b[0]) ? 100 : 0;
                return (b[1] + bHighRanking) - (a[1] + aHighRanking);
            })
            .slice(0, 6)
            .map(e => ({
                word: e[0],
                reason: highRankingThemes.includes(e[0]) ? 'High-value industry keyword discovered' : 'Frequently appearing organic keyword'
            }));

        if (suggestedKeywords.length === 0) {
            suggestedKeywords = [
                { word: "seo", reason: "Fundamental missing target" },
                { word: "optimization", reason: "High-value term" },
                { word: "performance", reason: "Crucial web metric" }
            ].filter(s => !foundKeywords.some(f => f.word === s.word)).slice(0, 3);
        }

        // ─── Competitor Discovery ───────────────────────────────────────────────
        const userHost = new URL(url).hostname.replace('www.', '');

        // Fix 1: Correct regex — split on dash, en-dash, pipe, or colon properly
        const productName = (() => {
            const titleSlug = title.split(/[-–|:]/)[0].trim();
            const stopSegments = ['home', 'welcome', 'index', 'official', 'the', 'best'];
            if (titleSlug && titleSlug.length > 1 && !stopSegments.includes(titleSlug.toLowerCase())) return titleSlug;
            return userHost.split('.')[0]; // fallback to domain slug e.g. "spidra"
        })();

        const BIG_TECH_BLOCKLIST = [
            'wikipedia.org', 'amazon.com', 'facebook.com', 'pinterest.com',
            'linkedin.com', 'youtube.com', 'twitter.com', 'instagram.com',
            'reddit.com', 'apple.com', 'microsoft.com', 'quora.com', 'medium.com',
            'dev.to', 'github.com', 'g2.com', 'capterra.com', 'getapp.com',
            'trustpilot.com', 'producthunt.com', 'alternativeto.net', 'crunchbase.com',
            'techcrunch.com', 'slashdot.org', 'sourceforge.net', 'ycombinator.com',
            'theresanaiforthat.com', 'futurepedia.io', 'toolify.ai', 'there100.org',
            'similarweb.com', 'statista.com', 'stackshare.io', 'saashub.com',
        ];

        const isBlocked = (host) => BIG_TECH_BLOCKLIST.some(b => host.includes(b));

        let competitorSlugs = []; // raw slugs from AlternativeTo
        let competitorUrls = [];  // guessed/confirmed domains

        // ── Strategy 1: AlternativeTo.net (most accurate — manually curated) ──
        try {
            const altSlug = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const altRes = await httpGet(`https://alternativeto.net/software/${altSlug}/`, 8000);
            if (altRes.ok) {
                const altHtml = await altRes.text();
                const $alt = cheerio.load(altHtml);
                const seenSlugs = new Set([altSlug]);
                $alt('a[href^="/software/"]').each((_, el) => {
                    if (competitorSlugs.length >= 20) return false;
                    const href = $alt(el).attr('href') || '';
                    const match = href.match(/^\/software\/([^/?#]+)/);
                    if (!match) return;
                    const slug = match[1].toLowerCase();
                    if (seenSlugs.has(slug)) return;
                    seenSlugs.add(slug);
                    competitorSlugs.push(slug);
                    for (const tld of ['.com', '.io', '.co', '.app', '.dev', '.ai']) {
                        const guessedHost = slug + tld;
                        if (!isBlocked(guessedHost) && !competitorUrls.includes(guessedHost)) {
                            competitorUrls.push(guessedHost);
                            break;
                        }
                    }
                });
            }
        } catch (_) { /* fall through */ }

        // ── Strategy 2: Targeted DuckDuckGo ─────────────────────────────────────
        // Fix 3: Always run DDG as supplement; not only when AlternativeTo gives < 3 URL guesses
        // (those guesses might all fail to resolve). Run if < 8 total guesses.
        if (competitorUrls.length < 8) {
            const descNiche = metaDescription.split(/\s+/).slice(0, 8).join(' ');
            const queries = [
                `"${productName}" alternatives similar tools -site:${userHost}`,
                `best ${descNiche} software alternatives competitors`,
                `tools similar to ${productName} ${userHost.split('.')[0]}`,
            ];

            for (const q of queries) {
                if (competitorUrls.length >= 12) break;
                try {
                    const ddgRes = await httpGet(
                        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
                        7000
                    );
                    const ddgHtml = await ddgRes.text();
                    const $ddg = cheerio.load(ddgHtml);

                    $ddg('.result__url, .result__a').each((_, el) => {
                        const rawHref = $ddg(el).attr('href') || $ddg(el).text();
                        let parsed = rawHref;
                        try {
                            const u = new URL(rawHref.startsWith('//') ? 'https:' + rawHref : rawHref);
                            const uddg = u.searchParams.get('uddg');
                            if (uddg) parsed = decodeURIComponent(uddg);
                        } catch (_) { /* use raw */ }

                        try {
                            const compHost = new URL(parsed.startsWith('http') ? parsed : 'https://' + parsed).hostname.replace('www.', '');
                            // Only allow clean root SaaS domains (no subdomains, no blog./docs./news.)
                            const looksLikeProduct = /^[a-z0-9][a-z0-9-]+\.[a-z]{2,6}$/.test(compHost)
                                && !compHost.startsWith('blog.')
                                && !compHost.startsWith('docs.')
                                && !compHost.startsWith('news.')
                                && !compHost.startsWith('help.')
                                && !compHost.startsWith('support.');
                            if (compHost && compHost !== userHost && !isBlocked(compHost) && looksLikeProduct && !competitorUrls.includes(compHost)) {
                                competitorUrls.push(compHost);
                            }
                        } catch (_) { /* skip */ }
                    });
                } catch (_) { /* ignore */ }
            }
        }

        competitorUrls = [...new Set(competitorUrls)].slice(0, 14);

        // ── Fetch & score each candidate ────────────────────────────────────────
        const seenResolvedHosts = new Set(); // Fix 4: dedup by actual resolved canonical host
        const competitorData = await Promise.allSettled(
            competitorUrls.map(async (compHost) => {
                const baseName = compHost.replace(/\.(com|io|co|app|dev|ai)$/, '');
                const tryUrls = [
                    `https://${compHost}`,
                    `https://${baseName}.io`,
                    `https://${baseName}.com`,
                    `https://${baseName}.ai`,
                    `https://${baseName}.dev`,
                ];
                for (const tryUrl of tryUrls) {
                    try {
                        const compRes = await httpGet(tryUrl, 6000);
                        if (!compRes.ok) continue;
                        const compHtml = await compRes.text();
                        const $c = cheerio.load(compHtml);

                        const resolvedHost = new URL(compRes.url).hostname.replace('www.', '');
                        if (seenResolvedHosts.has(resolvedHost) || resolvedHost === userHost) return null;
                        seenResolvedHosts.add(resolvedHost);

                        const compTitle = $c('title').text().trim() || '';
                        const compDesc = $c('meta[name="description"]').attr('content') || '';
                        const compKwContent = $c('meta[name="keywords"]').attr('content') || '';
                        const compKws = [...new Set(compKwContent.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 2))].slice(0, 5);

                        let cScore = 100;
                        if (!compTitle || compTitle.length < 50 || compTitle.length > 60) cScore -= 10;
                        if (!compDesc || compDesc.length < 120 || compDesc.length > 160) cScore -= 10;
                        if (!$c('link[rel="canonical"]').attr('href')) cScore -= 5;
                        if (!$c('meta[name="viewport"]').attr('content')) cScore -= 15;
                        if (!compRes.url.startsWith('https://')) cScore -= 15;
                        if ($c('h1').length !== 1) cScore -= 10;

                        const resolvedUrl = `https://${resolvedHost}`;
                        return { url: resolvedHost, resolvedUrl, score: Math.max(0, cScore), topKeywords: compKws };
                    } catch (_) { /* try next TLD */ }
                }
                return null;
            })
        );

        const liveCompetitors = competitorData
            .filter(r => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value)
            .filter(c => c.url !== userHost);

        // ── Rank: merge user + competitors, sort by score descending ───────────
        const userEntry = {
            url: userHost,
            resolvedUrl: url.startsWith('http') ? url : `https://${userHost}`,
            score,
            isUser: true,
            topKeywords: suggestedKeywords.slice(0, 5).map(k => k.word)
        };
        const allCompetitors = [...liveCompetitors, userEntry];
        allCompetitors.sort((a, b) => b.score - a.score);

        const userIndex = allCompetitors.findIndex(c => c.isUser);
        const top5 = allCompetitors.slice(0, 5);
        const userInTop5 = top5.some(c => c.isUser);

        let finalCompetitors = [];
        if (userInTop5) {
            finalCompetitors = top5;
        } else {
            finalCompetitors = [...top5, { ...userEntry, rank: userIndex + 1 }];
        }



        const result = {
            score,
            url,
            iframeBlocked,
            screenshotUrl,
            foundKeywords: foundKeywords.slice(0, 10),
            suggestedKeywords: suggestedKeywords.slice(0, 10),
            competitors: finalCompetitors,
            data: {
                loadTime: (fetchTime / 1000).toFixed(2) + 's',
                metaTags: (hasValidMetaDesc && hasValidTitle) ? 'Optimized' : 'Needs Work',
                mobileReady: hasViewport ? 'Verified' : 'Missing Viewport',
                https: isSecure ? 'Secure' : 'Insecure',
                imagesAlt: allImagesHaveAlt ? 'Optimized' : `${imagesWithoutAlt} Missing`,
                h1Check: hasOneH1 ? '1 Tag (Good)' : `${h1Count} Tags`,
            },
            details: {
                title: { value: title, status: hasValidTitle, deduction: deductions.title },
                metaDesc: { value: metaDescription, status: hasValidMetaDesc, deduction: deductions.metaDesc },
                h1Count: { value: h1Count, status: hasOneH1, deduction: deductions.h1 },
                canonical: { status: hasCanonical, deduction: deductions.canonical },
                favicon: { status: hasFavicon, deduction: deductions.favicon },
                headerNesting: { status: headerNestingLogical, deduction: deductions.headerNesting },
                images: { total: totalImages, withoutAlt: imagesWithoutAlt, status: allImagesHaveAlt, deduction: deductions.imagesAlt },
                isSecure: { status: isSecure, deduction: deductions.https },
                mobileCheck: { status: hasViewport, deduction: deductions.mobile },
                robotsCheck: { status: hasRobotsTxt, hasSitemap: hasSitemapRef, deduction: deductions.robots }
            }
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Internal server error during analysis' }, { status: 500 });
    }
}
