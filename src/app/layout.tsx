import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EventLeads AI — Smart Event Lead Management",
  description:
    "Capture, manage, and follow up with business event leads using AI-powered summaries and draft messages. Built with Next.js, MongoDB, and Gemini AI.",
  keywords: ["event leads", "CRM", "AI", "follow-up", "business events", "lead management"],
  openGraph: {
    title: "EventLeads AI",
    description: "AI-powered event lead manager",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
