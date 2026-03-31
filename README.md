# SEOMancer

**SEOMancer** is a powerful, developer-friendly SEO analysis and optimization tool built with Next.js, Tailwind CSS, Cheerio, and the Google Gemini AI SDK. It allows users to quickly scan websites, extract Core Web Data (load times, mobile readiness, secure connections, etc.), identify key SEO improvement opportunities, and securely preview their sites live.

## What is SEOMancer?

SEOMancer acts as your personal AI-driven SEO consultant. It goes beyond simple keyword counting by performing deep technical audits and using state-of-the-art AI (Gemini 1.5 Flash) to analyze the context of your page, providing human-readable, highly actionable advice to improve search engine rankings.

---

## Key Features & Flow

SEOMancer provides a streamlined, highly visual workflow:

1. **Dashboard Overview:** Your central hub for active projects, showing metric cards for total scans, optimizations done, and average SEO scores, along with an interactive activity chart.
2. **Single URL Scan:** 
   * **Target phase:** Enter a URL to crawl.
   * **Analyze phase:** SEOMancer connects to the URL, parsing the DOM with Cheerio to extract Title, Meta Description, Headings (H1/H2), Images, Links, and performance data. It computes an on-the-fly SEO score out of 100.
   * **Optimize phase:** The scraped data is fed to Google's Gemini AI, which acts as an "SEO Copilot" to generate AI-driven insights, rewritten titles, recommended meta descriptions, and structural content improvements.
   * **Review phase:** View everything in a beautiful, dark-mode native interface using Framer Motion animations.
3. **Gap Analysis (Competitor Comparison):** 
   * Enter your website and a competitor's website.
   * The tool fetches metrics for both simultaneously and compares them head-to-head across 20+ technical signals (Word count, internal links, headings, load times, schema markup, HTTPS, Open Graph tags, etc.).
   * Generates a comprehensive AI Executive Summary detailing exactly *why* the winner ranks higher and the top fixes the loser should implement.
   * Export the complete analysis report to PDF, Word (DOCX), or plain text!
4. **Rich Text Editing:** Features an integrated TipTap rich text editor for drafting improved content.
5. **Dark Mode Integration:** Full system-aware or manually toggleable Light/Dark mode via `next-themes`, offering a stunning and premium visual aesthetic in either mode.

---

##  Technologies & Tools Used

### Frontend & UI
- **[Next.js 16](https://nextjs.org/)** - React framework for building fast, full-stack applications (App Router).
- **[React 19](https://react.dev/)** - Core UI library.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development and styling.
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animation library for React (powers the smooth scan loading states and UI transitions).
- **[Lucide React](https://lucide.dev/) & [Hugeicons React](https://hugeicons.com/)** - Beautiful, consistent iconography.
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Perfect Next.js dark mode implementation.
- **[TipTap](https://tiptap.dev/)** - Headless, highly-extensible rich text editor for the content drafting experience.

### Backend, Data & Scraping
- **[Next.js Edge/Server API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Handles the crawler and AI requests securely on the server side.
- **[Cheerio](https://cheerio.js.org/)** - Fast, flexible, and lean implementation of core jQuery designed specifically for the server (used to scrape and parse target HTML pages for SEO tags).
- **[Supabase](https://supabase.com/)** - Open-source Firebase alternative (used for authentication, session management, and database storage).

### Artificial Intelligence
- **[@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)** - Google's official Gemini AI SDK. Features the `gemini-1.5-flash` model for blazing-fast inference when generating SEO suggestions, content rewrites, and gap analysis summaries.

### Utilities
- **jsPDF & AutoTable** - Used dynamically for generating robust PDF Gap Analysis reports directly in the browser.
- **date-fns** - Modern JavaScript date utility library.

---

##  Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm/yarn/pnpm installed. You will also need API keys for:
- Google Gemini AI (`GEMINI_API_KEY`)
- Supabase (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Installation 

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd SEOMancer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn / pnpm / bun install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Spin up the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

*Designed and engineered for modern SEO professionals and developers to build better, faster, and more optimized experiences on the web.*
