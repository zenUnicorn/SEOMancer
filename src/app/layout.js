import { Inter, Montserrat } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata = {
  title: "SEOMancer | The Ultimate SEO Optimization Tool",
  description: "Analyze, rank, and improve your website's SEO dynamically with our advanced AI-driven insight engine.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon-only-light.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    title: "SEOMancer | The Ultimate SEO Optimization Tool",
    description: "Analyze, rank, and improve your website's SEO dynamically with our advanced AI-driven insight engine.",
    url: "https://seomancer.com",
    siteName: "SEOMancer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEOMancer | The Ultimate SEO Optimization Tool",
    description: "Analyze, rank, and improve your website's SEO dynamically with our advanced AI-driven insight engine.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${montserrat.variable} antialiased font-sans selection:bg-purple-500 selection:text-white min-h-screen flex bg-[#f5f5f7] dark:bg-[#0f0f12] text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          <AuthProvider>
            <Sidebar />
            <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-[#f5f5f7] dark:bg-[#0f0f12]">
              {children}
            </main>
            {/* Structured Schema Data Injection */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  name: "SEOMancer",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Any",
                  description: "Analyze, rank, and improve your website's SEO dynamically with our advanced AI-driven insight engine.",
                  image: "https://seomancer.com/logo-dark.svg",
                  url: "https://seomancer.com"
                }),
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
