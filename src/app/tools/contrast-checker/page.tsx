import ContrastChecker from "@/components/pages/tools/ContrastChecker";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("contrast-checker");

export default function Page() {
  return (
    <ToolPage
      slug="contrast-checker"
      about={
        <>
          <h2>WCAG Contrast Requirements</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) define minimum contrast ratios so text
            stays readable for people with low vision or color blindness, and for everyone in
            bright sunlight.
          </p>
          <ul>
            <li><strong>AA normal text</strong> - at least 4.5:1</li>
            <li><strong>AA large text</strong> - at least 3:1 (18pt / 24px, or 14pt / 18.66px bold)</li>
            <li><strong>AAA normal text</strong> - at least 7:1</li>
            <li><strong>AAA large text</strong> - at least 4.5:1</li>
            <li><strong>UI components and icons</strong> - at least 3:1 against adjacent colors</li>
          </ul>
          <p>
            Most laws and accessibility policies require AA. Contrast ratios range from 1:1 (the
            same color) to 21:1 (black on white).
          </p>
          <h2>Fixing Low Contrast</h2>
          <p>
            If a pair fails, the suggestions keep your text color&apos;s hue and saturation and
            only adjust its lightness, so it stays on brand while becoming readable.
          </p>
        </>
      }
    >
      <ContrastChecker />
    </ToolPage>
  );
}
