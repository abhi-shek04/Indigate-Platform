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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";

export const metadata: Metadata = {
  title: {
    default: "IndiGate | India–Japan Talent Platform",
    template: "%s | IndiGate",
  },
  description:
    "IndiGate connects Indian professionals with top Japanese companies. Browse jobs with visa sponsorship, JLPT-matched roles, and relocation support.",
  keywords: [
    "India Japan jobs",
    "work in Japan",
    "JLPT jobs",
    "Indian talent Japan",
    "IndiGate",
    "Japan visa sponsorship",
  ],
  authors: [{ name: "Indobox Inc" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "IndiGate",
    title: "IndiGate | India–Japan Talent Platform",
    description:
      "Bridge your career to Japan. Find JLPT-matched jobs with visa sponsorship and full relocation support.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "IndiGate" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IndiGate | India–Japan Talent Platform",
    description: "Bridge your career to Japan.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/indobox-logo.png",
    apple: "/indobox-logo.png",
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
