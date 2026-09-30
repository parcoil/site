import HashGenerator from "@/components/pages/tools/HashGenerator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("hash-generator");

export default function Page() {
  return (
    <ToolPage
      slug="hash-generator"
      about={
        <>
          <h2>About Cryptographic Hashing</h2>
          <p>
            Cryptographic hash functions are mathematical algorithms that map data of arbitrary
            size to a fixed-size string of characters. They&apos;re designed to be one-way
            functions, meaning it&apos;s computationally infeasible to reverse the process.
          </p>
          <h2>Which Algorithm Should I Use?</h2>
          <ul>
            <li><strong>SHA-256</strong> - The modern default for checksums, signatures and blockchains</li>
            <li><strong>SHA-384 / SHA-512</strong> - Longer digests from the same SHA-2 family</li>
            <li><strong>SHA-1</strong> - Legacy; still seen in Git, but no longer collision-resistant</li>
            <li><strong>MD5</strong> - Fast and common for file checksums, but broken for security use</li>
          </ul>
          <p>
            Never store passwords with plain hashes like these. Use a slow password hashing
            algorithm such as Argon2, bcrypt or scrypt instead.
          </p>
          <h2>Common Uses</h2>
          <ul>
            <li>Verifying downloads against a published checksum</li>
            <li>Data integrity checking</li>
            <li>Digital signatures</li>
            <li>Detecting duplicate files</li>
          </ul>
        </>
      }
    >
      <HashGenerator />
    </ToolPage>
  );
}
