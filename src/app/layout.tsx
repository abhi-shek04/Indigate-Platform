import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "IndiGate — India × Japan Talent Platform",
  description:
    "IndiGate connects Indian professionals with Japanese companies. Find jobs in Japan, upload your resume, and launch your cross-border career.",
  keywords: [
    "IndiGate",
    "India Japan jobs",
    "Japan jobs for Indians",
    "JLPT jobs",
    "cross-border talent",
    "Indobox",
  ],
  authors: [{ name: "Indobox Inc" }],
  openGraph: {
    title: "IndiGate — India × Japan Talent Platform",
    description:
      "Connect Indian professionals with Japanese companies. Find jobs in Japan and launch your cross-border career.",
    siteName: "IndiGate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IndiGate — India × Japan Talent Platform",
    description: "Connect Indian professionals with Japanese companies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
