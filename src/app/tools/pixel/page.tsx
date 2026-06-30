import Pixel from "@/components/pages/tools/Pixel";
import React from "react";
import BannerAd from "@/components/BannerAd";

export const metadata = {
  title: "Pixel",
  description: "A tool to convert images to pixel art",
  hideNavbar: true,
};
function page() {
  return (
    <div>
      <Pixel />
      <section className="py-8 px-4 flex justify-center">
        <BannerAd adKey="fd31f3a208951023a4608886cfeb1c42" width={300} height={250} />
      </section>
    </div>
  );
}

export default page;
