import Pixel from "@/components/pages/tools/Pixel";
import React from "react";

export const metadata = {
  title: "Pixel",
  description: "A tool to convert images to pixel art",
  hideNavbar: true,
};
function page() {
  return (
    <div>
      <Pixel />
    </div>
  );
}

export default page;
