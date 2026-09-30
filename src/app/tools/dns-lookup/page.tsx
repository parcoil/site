import DnsLookup from "@/components/pages/tools/DnsLookup";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("dns-lookup");

export default function Page() {
  return (
    <ToolPage
      slug="dns-lookup"
      about={
        <>
          <h2>DNS Record Types</h2>
          <ul>
            <li><strong>A</strong> - the IPv4 address a domain points to</li>
            <li><strong>AAAA</strong> - the IPv6 address</li>
            <li><strong>CNAME</strong> - an alias pointing to another domain name</li>
            <li><strong>MX</strong> - mail servers that receive email for the domain, with priority</li>
            <li><strong>TXT</strong> - text records for SPF, DKIM, DMARC and domain verification</li>
            <li><strong>NS</strong> - the name servers responsible for the domain</li>
            <li><strong>SOA</strong> - start of authority: primary name server and zone serial</li>
            <li><strong>CAA</strong> - which certificate authorities may issue SSL certificates</li>
          </ul>
          <h2>How This Lookup Works</h2>
          <p>
            Queries are sent from your browser to Cloudflare&apos;s or Google&apos;s public DNS over
            HTTPS, so you see what the wider internet sees rather than your local network&apos;s
            cached answer. Comparing both resolvers is handy right after changing DNS, since
            updates can take up to the record&apos;s TTL to spread.
          </p>
        </>
      }
    >
      <DnsLookup />
    </ToolPage>
  );
}
