import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";

const SITE_URL = "https://playpola.vercel.app";
const SITE_TITLE = "Pola — Daily Logic Puzzles";
const SITE_DESCRIPTION =
  "6 bite-sized daily logic puzzles — Queens, Tango, Zip, Mini Sudoku, Patches & Fold. Play daily challenges or unlimited mode.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Pola",
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pola",
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
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="font-sans relative min-h-dvh bg-[#F4F6FA] text-neutral-900 antialiased selection:bg-sky-500/20 dark:bg-[#090B10] dark:text-neutral-100">
        {/* Ambient radial glow backdrop (pure gradients, zero CSS filter/blur to prevent WebKit top-bar 1x rasterization) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 6%, rgba(125, 211, 252, 0.28) 0%, transparent 44%), radial-gradient(circle at 92% 22%, rgba(253, 230, 138, 0.30) 0%, transparent 42%), radial-gradient(circle at 8% 62%, rgba(167, 243, 208, 0.28) 0%, transparent 42%), radial-gradient(circle at 88% 92%, rgba(254, 205, 211, 0.28) 0%, transparent 42%)",
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 6%, rgba(14, 165, 233, 0.14) 0%, transparent 44%), radial-gradient(circle at 92% 22%, rgba(245, 158, 11, 0.10) 0%, transparent 42%), radial-gradient(circle at 8% 62%, rgba(16, 185, 129, 0.11) 0%, transparent 42%), radial-gradient(circle at 88% 92%, rgba(8, 145, 178, 0.12) 0%, transparent 42%)",
            }}
          />
        </div>

        <ThemeProvider>
          <I18nProvider>
            {/* Mobile-first centered shell on tablets and desktop */}
            <div className="relative mx-auto min-h-dvh w-full max-w-[440px] font-sans md:border-x md:border-black/[0.06] md:dark:border-white/[0.08]">
              {children}
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
