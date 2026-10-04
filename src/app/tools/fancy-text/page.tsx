import FancyText from "@/components/pages/tools/FancyText";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("fancy-text");

export default function Page() {
  return (
    <ToolPage
      slug="fancy-text"
      about={
        <>
          <h2>How Does Fancy Text Work?</h2>
          <p>
            These aren&apos;t really fonts. Unicode, the standard every device uses for text,
            includes whole alphabets of stylized letters originally meant for math and other
            symbols, like 𝐛𝐨𝐥𝐝, 𝒮𝒸𝓇𝒾𝓅𝓉 and 𝔻𝕠𝕦𝕓𝕝𝕖-𝕤𝕥𝕣𝕦𝕔𝕜. Because they&apos;re
            characters rather than formatting, you can paste them anywhere that accepts text.
          </p>
          <h2>Where to Use It</h2>
          <ul>
            <li>Instagram, TikTok and X (Twitter) bios and captions</li>
            <li>Discord names, server channels and messages</li>
            <li>Gaming usernames and clan tags</li>
            <li>YouTube comments and video titles</li>
          </ul>
          <h2>A Note on Accessibility</h2>
          <p>
            Screen readers often read stylized characters letter by letter or skip them entirely,
            and search engines may not match them to normal words. Use fancy text for decoration,
            not for important information.
          </p>
        </>
      }
    >
      <FancyText />
    </ToolPage>
  );
}
