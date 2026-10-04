import CpsTest from "@/components/pages/tools/CpsTest";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("cps-test");

export default function Page() {
  return (
    <ToolPage
      slug="cps-test"
      about={
        <>
          <h2>What Is a CPS Test?</h2>
          <p>
            A CPS (clicks per second) test measures how fast you can click your mouse. It&apos;s
            popular with Minecraft PvP players and other gamers, where faster clicking means more
            hits. Pick a duration, click the box to start, and keep clicking until time runs out.
          </p>
          <h2>What&apos;s a Good CPS?</h2>
          <ul>
            <li><strong>4–6 CPS</strong> - average for normal clicking</li>
            <li><strong>6–8 CPS</strong> - above average</li>
            <li><strong>8–10 CPS</strong> - fast; typical for practiced gamers</li>
            <li><strong>10–14 CPS</strong> - very fast, usually with jitter or butterfly clicking</li>
            <li><strong>15+ CPS</strong> - drag clicking territory</li>
          </ul>
          <h2>Clicking Techniques</h2>
          <p>
            <strong>Jitter clicking</strong> tenses your arm to vibrate your finger rapidly.{" "}
            <strong>Butterfly clicking</strong> alternates two fingers on one button.{" "}
            <strong>Drag clicking</strong> slides a finger across the button so friction creates
            many clicks. Take breaks, because aggressive techniques can strain your wrist.
          </p>
          <p>Your best score for each duration is saved in your browser.</p>
        </>
      }
    >
      <CpsTest />
    </ToolPage>
  );
}
