import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CasesRouteHardReload } from "@/components/layout/CasesRouteHardReload";
import { DocumentLang } from "@/components/layout/DocumentLang";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { GA_MEASUREMENT_ID } from "@/lib/ga";
import { getSiteUrl, siteConfig } from "@/lib/site";

import "./globals.css";

const shippori = Shippori_Mincho({
  variable: "--font-shippori",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  preload: true,
});

const zen = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

const siteUrl = getSiteUrl();

const DEFAULT_TITLE =
  "BrandBridge｜海外ブランドの日本進出・販売パートナーマッチング";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  verification: {
    google: [
      "fJ3lII89FQz6e-aq-ittk-YNdqe-L-4H1MyLieClCz4",
      "kJ0g8NdJrYYQwy_OuXtV3SsDrUb0iWrHs49KGHJbTCA",
    ],
  },

  applicationName: siteConfig.name,

  keywords: [
    "BrandBridge",
    "商品提供企業",
    "販売パートナー",
    "代理店",
    "卸",
    "BtoB",
    "マッチング",
    "販路開拓",
    "商品",
  ],

  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: DEFAULT_TITLE,
    description: siteConfig.description,
  },

  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: siteConfig.description,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "business",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shippori.variable} ${zen.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>

        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <DocumentLang />

        <Header />

        <CasesRouteHardReload />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
