import FaviconGenerator from "@/components/pages/tools/FaviconGenerator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("favicon-generator");

export default function Page() {
  return (
    <ToolPage
      slug="favicon-generator"
      about={
        <>
          <h2>What&apos;s in the Favicon Package?</h2>
          <ul>
            <li><strong>favicon.ico</strong> - 16, 32 and 48px icons in one file for every browser</li>
            <li><strong>favicon-16x16.png / favicon-32x32.png</strong> - Crisp PNG favicons for modern browsers</li>
            <li><strong>apple-touch-icon.png</strong> - 180px icon for iPhone and iPad home screens</li>
            <li><strong>android-chrome-192x192.png / 512x512.png</strong> - Icons for Android and installable web apps</li>
            <li><strong>site.webmanifest</strong> - Web app manifest with your app name and theme color</li>
          </ul>
          <h2>How to Add a Favicon to Your Website</h2>
          <ol>
            <li>Upload your logo and adjust padding and background</li>
            <li>Download the ZIP and extract it into your site&apos;s root folder</li>
            <li>Paste the HTML snippet into the <code>&lt;head&gt;</code> of your pages</li>
            <li>Hard-refresh your browser, since favicons are cached aggressively</li>
          </ol>
          <h2>Tips for a Great Favicon</h2>
          <p>
            Favicons are tiny, so simple shapes and bold colors work best. Avoid thin lines and
            small text, and test that your icon is recognizable at 16×16 pixels. Your image is
            processed entirely in your browser.
          </p>
        </>
      }
    >
      <FaviconGenerator />
    </ToolPage>
  );
}
