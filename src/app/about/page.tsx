import React from "react";
import AdBanner from "@/components/AdBanner";

function page() {
  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-bold text-center m-5">About</h1>
       <div className="text-center">
         <p>Info to be added soon</p>
       </div>

       <div className="max-w-4xl mx-auto px-4 py-8">
         <AdBanner />
       </div>
     </div>
  );
}

export default page;
