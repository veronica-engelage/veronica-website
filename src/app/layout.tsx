import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileStickyCta from "@/components/MobileStickyCta";
import { Lora, Raleway } from "next/font/google";
import Script from "next/script";
import AnalyticsPageView from "@/components/analytics/AnalyticsPageView";


const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veronica Engelage",
  description: "Charleston & Mount Pleasant Real Estate",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // For now: keep your existing hardcoded phone source so this is truly drop-in.
  // Later: fetch from Sanity in a server layout and pass it down.
  const phone = "854 837 2944";

  return (
    <html
      lang="en"
      className={`${lora.variable} ${raleway.variable}`}
      suppressHydrationWarning
    >
      <head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
(function() {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', useDark);
  } catch (e) {}
})();
      `,
    }}
  />

  {/* Google Analytics (GA4) */}
  {process.env.NEXT_PUBLIC_GA_ID ? (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            anonymize_ip: true,
            send_page_view: false
          });
        `}
      </Script>
    </>
  ) : null}
</head>

      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        <Header />

        {/* Add bottom padding so the sticky bar doesn't cover content */}
        <main className="pb-24 md:pb-0">{children}</main>

        <Footer phone={phone} />

        {/* Mobile Sticky CTA */}
        <MobileStickyCta phone={phone} />
      </body>
    </html>
  );
}
