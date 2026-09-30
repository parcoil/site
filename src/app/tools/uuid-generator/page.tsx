import UUIDGenerator from "@/components/pages/tools/UUIDGenerator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("uuid-generator");

export default function Page() {
  return (
    <ToolPage
      slug="uuid-generator"
      about={
        <>
          <h2>About UUIDs</h2>
          <p>
            A UUID (Universally Unique Identifier) is a 128-bit number used to uniquely identify
            information in computer systems. UUIDs are designed to be unique across space and time,
            making them ideal for use as primary keys in databases or identifiers in distributed
            systems.
          </p>
          <h2>UUID Versions</h2>
          <ul>
            <li><strong>UUID v1:</strong> Based on timestamp and MAC address</li>
            <li><strong>UUID v3:</strong> Based on MD5 hash of namespace and name</li>
            <li><strong>UUID v4:</strong> Random, the most widely used version</li>
            <li><strong>UUID v5:</strong> Based on SHA-1 hash of namespace and name</li>
            <li>
              <strong>UUID v7:</strong> A millisecond timestamp followed by random bits, so IDs
              sort in creation order. Great for database primary keys.
            </li>
          </ul>
          <h2>Common Uses</h2>
          <ul>
            <li>Database primary keys</li>
            <li>Session identifiers</li>
            <li>API keys and tokens</li>
            <li>File names in distributed systems</li>
            <li>Object identifiers in applications</li>
          </ul>
        </>
      }
    >
      <UUIDGenerator />
    </ToolPage>
  );
}
