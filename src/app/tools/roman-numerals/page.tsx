import RomanNumerals from "@/components/pages/tools/RomanNumerals";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("roman-numerals");

export default function Page() {
  return (
    <ToolPage
      slug="roman-numerals"
      about={
        <>
          <h2>How Roman Numerals Work</h2>
          <p>
            Roman numerals combine seven letters: I (1), V (5), X (10), L (50), C (100), D (500)
            and M (1,000). Symbols are added from largest to smallest, so XVI is 10 + 5 + 1 = 16.
          </p>
          <p>
            When a smaller symbol comes before a larger one, it&apos;s subtracted instead. Only
            six of these pairs are allowed: IV (4), IX (9), XL (40), XC (90), CD (400) and CM (900).
            A symbol is never repeated more than three times in a row, which is why 4 is IV and not
            IIII.
          </p>
          <h2>Examples</h2>
          <ul>
            <li>1999 = MCMXCIX</li>
            <li>2000 = MM</li>
            <li>2026 = MMXXVI</li>
            <li>3999 = MMMCMXCIX, the largest standard Roman numeral</li>
          </ul>
        </>
      }
    >
      <RomanNumerals />
    </ToolPage>
  );
}
