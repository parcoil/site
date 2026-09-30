import UnixTimestamp from "@/components/pages/tools/UnixTimestamp";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("unix-timestamp");

export default function Page() {
  return (
    <ToolPage
      slug="unix-timestamp"
      about={
        <>
          <h2>What Is a Unix Timestamp?</h2>
          <p>
            A Unix timestamp (or epoch time) is the number of seconds since 00:00:00 UTC on
            January 1, 1970, not counting leap seconds. Because it&apos;s a single number with no
            time zone, it&apos;s the standard way computers store and compare moments in time.
          </p>
          <h2>Seconds or Milliseconds?</h2>
          <p>
            Unix systems, PHP and most databases use seconds (10 digits today), while JavaScript
            and Java use milliseconds (13 digits). This converter detects which one you pasted.
          </p>
          <h2>Get the Current Timestamp in Code</h2>
          <ul>
            <li>JavaScript: <code>Math.floor(Date.now() / 1000)</code></li>
            <li>Python: <code>int(time.time())</code></li>
            <li>PHP: <code>time()</code></li>
            <li>Bash: <code>date +%s</code></li>
            <li>SQL (PostgreSQL): <code>extract(epoch from now())</code></li>
          </ul>
          <h2>The Year 2038 Problem</h2>
          <p>
            Systems that store timestamps as signed 32-bit integers will overflow at 03:14:07 UTC
            on January 19, 2038 (timestamp 2147483647). Modern systems use 64-bit values.
          </p>
        </>
      }
    >
      <UnixTimestamp />
    </ToolPage>
  );
}
