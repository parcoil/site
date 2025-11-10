"use client";

import { useEffect } from "react";

export default function AdBanner() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle && window.adsbygoogle.push) {
          window.adsbygoogle.push({});
        }
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1565760898646999"
        data-ad-slot="3836598101"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
