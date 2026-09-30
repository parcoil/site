import ChmodCalculator from "@/components/pages/tools/ChmodCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("chmod-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="chmod-calculator"
      about={
        <>
          <h2>How Linux Permissions Work</h2>
          <p>
            Every file on Linux and macOS has three sets of permissions: for the{" "}
            <strong>owner</strong>, the <strong>group</strong>, and <strong>others</strong>. Each
            set can allow reading (4), writing (2) and executing (1). Adding the numbers gives one
            digit per set, so <code>755</code> means the owner can do everything (4+2+1) while
            everyone else can read and execute (4+1).
          </p>
          <h2>Common Permission Values</h2>
          <ul>
            <li><code>644</code> (<code>rw-r--r--</code>) - normal files like HTML and images</li>
            <li><code>755</code> (<code>rwxr-xr-x</code>) - folders and executable scripts</li>
            <li><code>600</code> (<code>rw-------</code>) - private files such as config with passwords</li>
            <li><code>400</code> (<code>r--------</code>) - SSH private keys</li>
            <li><code>777</code> (<code>rwxrwxrwx</code>) - anyone can do anything; almost never a good idea</li>
          </ul>
          <h2>Special Bits</h2>
          <p>
            An optional fourth leading digit sets special bits: <strong>setuid</strong> (4) runs a
            program as its owner, <strong>setgid</strong> (2) runs it as its group or makes new files
            in a folder inherit the group, and the <strong>sticky bit</strong> (1) stops users deleting
            each other&apos;s files in shared folders like <code>/tmp</code>.
          </p>
        </>
      }
    >
      <ChmodCalculator />
    </ToolPage>
  );
}
