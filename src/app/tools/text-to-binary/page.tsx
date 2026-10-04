import TextToBinary from "@/components/pages/tools/TextToBinary";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("text-to-binary");

export default function Page() {
  return (
    <ToolPage
      slug="text-to-binary"
      about={
        <>
          <h2>How Text Becomes Binary</h2>
          <p>
            Computers store text as numbers. This tool encodes your text as UTF-8, where each
            character becomes one to four bytes, then writes every byte as an 8-digit binary
            number. For example, the letter <code>A</code> is byte 65, which is{" "}
            <code>01000001</code> in binary and <code>41</code> in hex.
          </p>
          <h2>Decoding Tips</h2>
          <ul>
            <li>Separate bytes with spaces, commas or new lines.</li>
            <li>Binary and hex can also be pasted as one long unbroken string.</li>
            <li>Prefixes like <code>0x</code> and <code>0b</code> are ignored.</li>
            <li>Emoji and accented letters use more than one byte, so keep all of their bytes together.</li>
          </ul>
        </>
      }
    >
      <TextToBinary />
    </ToolPage>
  );
}
