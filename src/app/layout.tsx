import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parcoil",
  description: "Creators of Lunaar and Sparkle Windows optimizer. ",
  keywords:
    "Parcoil, Lunaar, Starlight, Sparkle, Windows optimizer, unblocked games, open source, optimizer, windows tweaks, windows tweaker, vtrl, hone",
  robots: "index, follow",
};
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/parcoil.png" sizes="any" />
      <head>
        <Script
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1565760898646999"
          crossOrigin="anonymous"
        ></Script>
        <Script
          async
          src="https://fundingchoicesmessages.google.com/i/pub-1565760898646999?ers=1"
          strategy="afterInteractive"
        />

        <Script id="google-funding-choices" strategy="afterInteractive">
          {`
            (function() {
              function signalGooglefcPresent() {
                if (!window.frames['googlefcPresent']) {
                  if (document.body) {
                    const iframe = document.createElement('iframe');
                    iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
                    iframe.style.display = 'none';
                    iframe.name = 'googlefcPresent';
                    document.body.appendChild(iframe);
                  } else {
                    setTimeout(signalGooglefcPresent, 0);
                  }
                }
              }
              signalGooglefcPresent();
            })();
          `}
        </Script>
      </head>
      <body
        className={`${poppins.className} antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors />
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-FQ8PQ7DD0P" />
    </html>
  );
}
