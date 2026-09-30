import SubnetCalculator from "@/components/pages/tools/SubnetCalculator";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("subnet-calculator");

export default function Page() {
  return (
    <ToolPage
      slug="subnet-calculator"
      about={
        <>
          <h2>CIDR Notation</h2>
          <p>
            An address like <code>192.168.1.0/24</code> means the first 24 bits identify the
            network and the remaining 8 bits identify hosts, giving 256 addresses. Each step down
            in prefix length doubles the size of the network.
          </p>
          <h2>Common Subnet Sizes</h2>
          <ul>
            <li><strong>/32</strong> - a single host (255.255.255.255)</li>
            <li><strong>/30</strong> - 4 addresses, 2 usable; classic point-to-point links</li>
            <li><strong>/28</strong> - 16 addresses, 14 usable</li>
            <li><strong>/24</strong> - 256 addresses, 254 usable; a typical home or office LAN</li>
            <li><strong>/16</strong> - 65,536 addresses</li>
            <li><strong>/8</strong> - 16.7 million addresses, such as 10.0.0.0/8</li>
          </ul>
          <h2>Why Are Two Addresses Unusable?</h2>
          <p>
            In most subnets the first address identifies the network itself and the last is the
            broadcast address, so hosts get everything in between. /31 point-to-point links
            (RFC 3021) and /32 single hosts are the exceptions.
          </p>
        </>
      }
    >
      <SubnetCalculator />
    </ToolPage>
  );
}
