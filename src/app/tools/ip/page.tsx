import IPInfoCard from "@/components/pages/tools/ip";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("ip");

export default function Page() {
  return (
    <ToolPage
      slug="ip"
      about={
        <>
          <h2>What is an IP Address?</h2>
          <p>
            An IP address (Internet Protocol address) is a unique number assigned to every device
            connected to the internet. It allows devices to communicate with each other by
            identifying their network location.
          </p>
          <p>
            There are two types of IP addresses: <strong>IPv4</strong> and <strong>IPv6</strong>.
            IPv4 is the most common and looks like 192.168.1.1, while IPv6 is newer and provides a
            much larger address space.
          </p>
          <p>
            Your IP address can reveal information such as your approximate location, internet
            service provider (ISP), and more. This tool from <strong>Parcoil</strong> helps you
            quickly see your public IP and related connection details.
          </p>
          <h2>Why Should I Know My IP?</h2>
          <ul>
            <li>To troubleshoot network issues</li>
            <li>To check if your VPN is working</li>
            <li>For security or privacy audits</li>
            <li>To configure firewall or port forwarding</li>
          </ul>
        </>
      }
    >
      <IPInfoCard />
    </ToolPage>
  );
}
