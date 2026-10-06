import BiosPasswordRecovery from "@/components/pages/tools/BiosPasswordRecovery";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("bios-password");

export default function Page() {
  return (
    <ToolPage
      slug="bios-password"
      about={
        <>
          <h2>What This Does</h2>
          <p>
            When a laptop is locked with a forgotten BIOS/UEFI password, many vendors show a numeric
            or alphanumeric <strong>challenge code</strong> (often after several failed attempts),
            or the machine can be identified by a service tag or serial number. For a long list of
            older BIOS families, that challenge maps deterministically to a master/recovery password
            that unlocks the firmware. This tool recognises the challenge format, runs every
            compatible algorithm locally, and labels each candidate with its vendor family.
          </p>
          <h2>Everything Stays on Your Device</h2>
          <p>
            All of the algorithms run in your browser. The challenge, any service tag or serial
            number, and every generated password are never uploaded to a server or sent to any
            third-party API.
          </p>
          <h2>Intended Use</h2>
          <p>
            This is for recovering access to hardware you <strong>own</strong> or are
            <strong> authorised to service</strong> &mdash; a machine you bought second-hand, an old
            laptop whose password you forgot, or a device a client handed you to repair. Don&apos;t
            use it on hardware you have no right to access.
          </p>
          <h2>Supported Families</h2>
          <ul>
            <li><strong>ASUS</strong> &mdash; derived from the BIOS build date</li>
            <li><strong>Dell</strong> &mdash; service tag or HDD serial plus suffix (595B, D35B, 2A7B, A95B, 1D3B, 6FF1, 1F66, 1F5A, BF97, E7A8), and Latitude 3540</li>
            <li><strong>Fujitsu-Siemens</strong> &mdash; hexadecimal, 5&times;4 and 6&times;4 decimal, and 203c-d001 codes</li>
            <li><strong>HP / Compaq</strong> &mdash; Mini netbook codes, AMI &ldquo;A codes&rdquo;, and Insyde &ldquo;i&rdquo; codes</li>
            <li><strong>Insyde H2O</strong> &mdash; generic 8-digit and Acer 10-digit challenges</li>
            <li><strong>Phoenix</strong> &mdash; generic, HP/Compaq and Fujitsu-Siemens 5-digit challenges</li>
            <li><strong>Samsung</strong> &mdash; 12&ndash;18 and 44 hexadecimal digits</li>
            <li><strong>Sony</strong> &mdash; 7-digit serials and 4&times;4 codes</li>
          </ul>
          <h2>If Several Algorithms Match</h2>
          <p>
            Some challenge formats are ambiguous (an 8-digit code could be an ASUS date or an Insyde
            challenge, for example), so the tool shows results from every algorithm that fits. Try
            them in order; any one that the firmware accepts unlocks the machine. Some families also
            produce more than one candidate per challenge.
          </p>
        </>
      }
    >
      <BiosPasswordRecovery />
    </ToolPage>
  );
}
