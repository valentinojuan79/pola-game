import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pola — Daily Logic Puzzles",
  description: "Daily & Unlimited Logic Puzzles crafted with tactile iOS precision.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pola",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F2F4F8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakartaSans.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="font-sans relative min-h-[100dvh] bg-[#F4F6FA] text-neutral-900 antialiased selection:bg-sky-500/20 dark:bg-[#090B10] dark:text-neutral-100">
        {/* Ambient blurred iOS Liquid Glass refraction orbs (fixed behind layout) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          {/* Top-left soft sky orb */}
          <div className="absolute -top-24 -left-20 h-[360px] w-[360px] rounded-full bg-sky-300/35 blur-[92px] dark:bg-sky-500/18" />
          {/* Top-right soft warm amber orb */}
          <div className="absolute top-[14%] -right-24 h-[330px] w-[330px] rounded-full bg-amber-200/40 blur-[94px] dark:bg-amber-500/12" />
          {/* Mid-left soft mint orb */}
          <div className="absolute top-[52%] -left-24 h-[310px] w-[310px] rounded-full bg-emerald-200/35 blur-[96px] dark:bg-emerald-500/14" />
          {/* Lower-right soft rose orb */}
          <div className="absolute -bottom-16 right-[4%] h-[300px] w-[300px] rounded-full bg-rose-200/35 blur-[94px] dark:bg-cyan-600/14" />
        </div>

        <ThemeProvider>
          <I18nProvider>
            {/* Mobile-first centered shell on desktop */}
            <div className="relative mx-auto min-h-[100dvh] w-full max-w-[430px] font-sans md:border-x md:border-black/[0.06] md:dark:border-white/[0.08]">
              {children}
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
