import IPInfoCard from "@/components/pages/tools/ip";
import AdBanner from "@/components/AdBanner";
import BannerAd from "@/components/BannerAd";

export const metadata = {
  title: "Parcoil — IP Info",
  description:
    "View your public IP address, location, and connection details instantly.",
  keywords: [
    "IP address",
    "IP lookup",
    "Parcoil",
    "network info",
    "What's My IP",
    "IP geolocation",
    "my IP",
  ],
  authors: [{ name: "Parcoil" }],
};

function page() {
  return (
    <>
      <IPInfoCard />
      
      <section className="py-8 px-4">
        <AdBanner />
      </section>
      
      <div className="px-4 py-6 max-w-3xl mx-auto ">
        <h1 className="text-2xl font-semibold mb-4">What is an IP Address?</h1>
        <p className="mb-4">
          An IP address (Internet Protocol address) is a unique number assigned
          to every device connected to the internet. It allows devices to
          communicate with each other by identifying their network location.
        </p>
        <p className="mb-4">
          There are two types of IP addresses: <strong>IPv4</strong> and{" "}
          <strong>IPv6</strong>. IPv4 is the most common and looks like
          192.168.1.1, while IPv6 is newer and provides a much larger address
          space.
        </p>
        <p className="mb-4">
          Your IP address can reveal information such as your approximate
          location, internet service provider (ISP), and more. This tool from{" "}
          <strong>Parcoil</strong> helps you quickly see your public IP and
          related connection details.
        </p>
        <h2 className="text-xl font-medium mt-6 mb-2">
          Why Should I Know My IP?
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>To troubleshoot network issues</li>
          <li>To check if your VPN is working</li>
          <li>For security or privacy audits</li>
          <li>To configure firewall or port forwarding</li>
        </ul>
      </div>

      <section className="py-8 px-4 mt-8">
        <AdBanner />
      </section>

      <section className="py-8 px-4 flex justify-center">
        <BannerAd adKey="fd31f3a208951023a4608886cfeb1c42" width={300} height={250} />
      </section>
    </>
  );
}

export default page;
