import NumberBaseConverter from "@/components/pages/tools/NumberBaseConverter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("number-base-converter");

export default function Page() {
  return (
    <ToolPage
      slug="number-base-converter"
      about={
        <>
          <h2>How Number Bases Work</h2>
          <p>
            A number base says how many digits are available before you carry to the next place.
            Decimal uses ten digits (0–9), binary uses two (0 and 1), octal uses eight and
            hexadecimal uses sixteen (0–9 then a–f). The value 255 is <code>11111111</code> in
            binary, <code>377</code> in octal and <code>ff</code> in hex.
          </p>
          <h2>Where You&apos;ll See Them</h2>
          <ul>
            <li><strong>Binary</strong> - bit flags, masks and low-level data</li>
            <li><strong>Octal</strong> - Unix file permissions like 755</li>
            <li><strong>Hexadecimal</strong> - colors (#ff5733), memory addresses and byte dumps</li>
            <li><strong>Base 36</strong> - short IDs and URL shorteners</li>
          </ul>
          <p>
            Type in any box and the others update instantly. Prefixes like <code>0x</code> and{" "}
            <code>0b</code> are understood, and numbers of any size are converted exactly.
          </p>
        </>
      }
    >
      <NumberBaseConverter />
    </ToolPage>
  );
}
