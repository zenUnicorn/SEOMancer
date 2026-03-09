import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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
            response = await fetch(url, {
                headers: {
                    'User-Agent': 'SEOMancer-Bot/1.0',
                },
            });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch the URL. Please check if it is correct.' }, { status: 400 });
        }

        const fetchTime = Date.now() - startTime;
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
            const robotsRes = await fetch(`${baseUrl}/robots.txt`);
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
        let suggestedKeywords = [];

        if (originalKeywords.length > 0) {
            suggestedKeywords = [...new Set(originalKeywords.map(k => k.toLowerCase()))].map(word => ({
                word,
                reason: 'Found in the page\'s keywords meta tag'
            }));
        } else {
            // Create some from text if no keywords meta tag
            const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
            const words = bodyText.split(' ').filter(w => w.length > 4); // Filter very short words
            const wordCounts = {};
            // Filter out common stopwords
            const stopWords = ['these', 'those', 'there', 'their', 'about', 'which', 'would', 'could', 'should'];
            words.forEach(w => {
                const lw = w.toLowerCase();
                if (!stopWords.includes(lw)) {
                    wordCounts[lw] = (wordCounts[lw] || 0) + 1;
                }
            });

            // Prioritize terms relating to SEO and performance generically if they exist
            const highRankingThemes = ["software", "marketing", "business", "seo", "optimization", "performance", "digital", "agency", "tech"];

            suggestedKeywords = Object.entries(wordCounts)
                .sort((a, b) => {
                    const aHighRanking = highRankingThemes.includes(a[0]) ? 100 : 0;
                    const bHighRanking = highRankingThemes.includes(b[0]) ? 100 : 0;
                    return (b[1] + bHighRanking) - (a[1] + aHighRanking);
                })
                .slice(0, 5)
                .map(e => ({
                    word: e[0],
                    reason: highRankingThemes.includes(e[0]) ? 'Identified as a high-ranking industry keyword on your page' : 'Frequently appearing content keyword'
                }));
        }

        if (suggestedKeywords.length === 0) {
            suggestedKeywords = [
                { word: "seo", reason: "Fundamental missing target" },
                { word: "optimization", reason: "High value organic term" },
                { word: "performance", reason: "Crucial for web metrics" }
            ];
        }

        // Build a niche-aware search query from the site's own meta signals
        const searchTerms = [
            title.split(/[-|–]/)[0].trim(),
            ...(originalKeywords.slice(0, 2)),
            metaDescription.split(' ').slice(0, 6).join(' ')
        ].filter(Boolean);
        // Add "alternatives" to specifically find competitor lists
        const searchQuery = [...new Set(searchTerms)].slice(0, 2).join(' ') + ' alternatives';

        const BIG_TECH_BLOCKLIST = [
            'wikipedia.org', 'amazon.com', 'facebook.com', 'pinterest.com',
            'linkedin.com', 'youtube.com', 'twitter.com', 'instagram.com',
            'reddit.com', 'apple.com', 'microsoft.com', 'quora.com', 'medium.com'
        ];

        // Search DuckDuckGo for real niche competitors
        let competitorUrls = [];
        try {
            const ddgRes = await fetch(
                `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; SEOMancer/1.0)',
                        'Accept': 'text/html',
                    },
                }
            );
            const ddgHtml = await ddgRes.text();
            const $ddg = cheerio.load(ddgHtml);
            const userHost = new URL(url).hostname.replace('www.', '');

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
                    const isBlocked = BIG_TECH_BLOCKLIST.some(blocked => compHost.includes(blocked));

                    if (compHost && compHost !== userHost && !isBlocked && !competitorUrls.find(c => c.includes(compHost))) {
                        competitorUrls.push(compHost);
                    }
                } catch (_) { /* skip */ }
            });
        } catch (e) {
            console.error('DDG search failed:', e.message);
        }

        competitorUrls = [...new Set(competitorUrls)].slice(0, 10);

        // For each competitor, fetch their page and extract meta tags + SEO signals
        const competitorData = await Promise.allSettled(
            competitorUrls.map(async (compHost) => {
                try {
                    const compRes = await fetch(`https://${compHost}`, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOMancer/1.0)' },
                        signal: AbortSignal.timeout(6000),
                    });
                    const compHtml = await compRes.text();
                    const $c = cheerio.load(compHtml);

                    const compTitle = $c('title').text().trim() || '';
                    const compDesc = $c('meta[name="description"]').attr('content') || '';
                    const compKwContent = $c('meta[name="keywords"]').attr('content') || '';
                    const compKws = [...new Set(compKwContent.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 2))].slice(0, 5);

                    // Quick score for the competitor
                    let cScore = 100;
                    if (!compTitle || compTitle.length < 50 || compTitle.length > 60) cScore -= 10;
                    if (!compDesc || compDesc.length < 120 || compDesc.length > 160) cScore -= 10;
                    if (!$c('link[rel="canonical"]').attr('href')) cScore -= 5;
                    if (!$c('meta[name="viewport"]').attr('content')) cScore -= 15;
                    if (!compRes.url.startsWith('https://')) cScore -= 15;
                    const cH1 = $c('h1').length;
                    if (cH1 !== 1) cScore -= 10;

                    return {
                        url: compHost,
                        score: Math.max(0, cScore),
                        topKeywords: compKws.length > 0 ? compKws : []
                    };
                } catch (_) {
                    return null;
                }
            })
        );

        const liveCompetitors = competitorData
            .filter(r => r.status === 'fulfilled' && r.value !== null && r.value.topKeywords && r.value.topKeywords.length > 0)
            .map(r => r.value);

        // Blend in the user's site and rank
        const userEntry = { url: new URL(url).hostname.replace('www.', ''), score, isUser: true, topKeywords: suggestedKeywords.slice(0, 5).map(k => k.word) };
        const allCompetitors = [...liveCompetitors, userEntry];
        allCompetitors.sort((a, b) => b.score - a.score);

        const userIndex = allCompetitors.findIndex(c => c.isUser);

        let finalCompetitors = [];
        if (userIndex < 10) {
            finalCompetitors = allCompetitors.slice(0, userIndex + 1);
        } else {
            finalCompetitors = allCompetitors.slice(0, 10);
        }

        const result = {
            score,
            url,
            keywords: suggestedKeywords.slice(0, 5),
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
