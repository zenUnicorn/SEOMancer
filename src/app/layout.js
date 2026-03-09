import { Inter, Montserrat } from "next/font/google";
import Sidebar from "@/components/Sidebar";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${montserrat.variable} antialiased bg-[#fbfbfe] text-gray-900 font-sans selection:bg-purple-500 selection:text-white min-h-screen flex`} >
        <Sidebar />
        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
