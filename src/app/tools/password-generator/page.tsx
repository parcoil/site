import PasswordGenerator from "@/components/pages/tools/Password";
import React from "react";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Secure Password Generator | Free Online Tool | Parcoil",
  description:
    "Create strong, unique passwords instantly with Parcoil's free password generator tool. Customize length and character types for maximum security.",
  keywords:
    "password generator, secure password, strong password, random password generator, online security tool, Parcoil tools",
  openGraph: {
    title: "Create Strong Passwords Instantly | Parcoil Password Generator",
    description:
      "Generate secure, customizable passwords to protect your online accounts with Parcoil's free tool.",
    images: [
      { url: "/images/password-generator-og.jpg", width: 1200, height: 630 },
    ],
    type: "website",
  },
  canonical: "https://parcoil.com/tools/password-generator",
};

export default function PasswordGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col py-12 px-4 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Secure Password Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Create strong, unique passwords to protect your online accounts.
          Customize length and character types to match any security
          requirement.
        </p>
      </header>

      <main>
        <PasswordGenerator />
      </main>

      <section className="mt-12 text-left max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Why Use a Password Generator?
        </h2>
        <div className="space-y-4">
          <p>
            In today's digital world, having strong passwords is essential for
            protecting your personal information. Weak or repeated passwords are
            one of the most common causes of account breaches and identity
            theft.
          </p>
          <p>
            Our password generator creates unpredictable combinations of
            characters that are virtually impossible to crack through brute
            force methods, keeping your accounts secure.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">
            Benefits of Strong Passwords
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Protect personal and financial information</li>
            <li>Prevent unauthorized access to your accounts</li>
            <li>Reduce the risk of identity theft</li>
            <li>Maintain privacy across multiple platforms</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">
            How to Use This Tool
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Adjust the password length using the slider</li>
            <li>Select which character types to include</li>
            <li>Copy your generated password with one click</li>
            <li>Use a different password for each of your accounts</li>
          </ol>
         </div>
       </section>

       <section className="py-8 px-4">
         <div className="max-w-4xl mx-auto">
           <AdBanner />
         </div>
       </section>
     </div>
  );
}
