import GamepadTester from "@/components/pages/tools/GamepadTester";
import React from "react";
import AdBanner from "@/components/AdBanner";


export const metadata = {
  title: "Gamepad Tester | Test Your Controller Online | Parcoil",
  description:
    "Test your gamepad or controller online with Parcoil's free gamepad tester. Check buttons, triggers, and analog sticks in real time.",
  keywords:
    "gamepad tester, controller tester, gamepad test, xbox controller, ps4 controller, ps5 controller, nintendo switch controller, online gamepad test",
  openGraph: {
    title: "Gamepad Tester | Test Your Controller Online | Parcoil",
    description:
      "Test your gamepad or controller online. Check buttons, triggers, and analog sticks in real time.",
    images: [
      { url: "/images/gamepad-tester-og.jpg", width: 1200, height: 630 },
    ],
    type: "website",
  },
  canonical: "https://parcoil.com/tools/gamepad-tester",
};

export default function GamepadTesterPage() {
  return (
    <div className="min-h-screen flex flex-col py-12 px-4 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Gamepad Tester
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Connect a gamepad via USB or Bluetooth, press a button, and see
          all your controller inputs in real time. No downloads required.
        </p>
      </header>

      <main>
        <GamepadTester />
      </main>

      <section className="py-8 px-4 mt-6">
        <AdBanner />
      </section>

      <section className="mt-8 text-left max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Why Use a Gamepad Tester?
        </h2>
        <div className="space-y-4">
          <p>
            Whether you're troubleshooting a faulty controller or just want to
            verify that all buttons and sticks are working, a gamepad tester
            gives you instant feedback without installing any software.
          </p>
          <p>
            This tool reads directly from the browser's Gamepad API, so it works
            with any standard USB or Bluetooth controller — including Xbox,
            PlayStation, Switch Pro, and generic gamepads.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-2">
            How to Use This Tool
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Connect your gamepad via USB cable or Bluetooth</li>
            <li>Press any button on the controller to activate it</li>
            <li>Watch the button indicators light up as you press them</li>
            <li>Move the analog sticks to see real-time axis values</li>
          </ol>

          <h3 className="text-xl font-medium mt-6 mb-2">
            What You Can Test
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>All face buttons (A/B/X/Y or their equivalents)</li>
            <li>Shoulder buttons and analog triggers</li>
            <li>Left and right analog sticks with X/Y axis values</li>
            <li>D-pad directions</li>
            <li>Special buttons like Start, Back, and Home</li>
          </ul>
        </div>
      </section>

      <section className="py-8 px-4 mt-8">
        <AdBanner />
      </section>

    </div>
  );
}
