import DiceRoller from "@/components/pages/tools/DiceRoller";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("dice-roller");

export default function Page() {
  return (
    <ToolPage
      slug="dice-roller"
      about={
        <>
          <h2>Virtual Dice for Any Game</h2>
          <p>
            Roll up to ten dice at once in any of the standard tabletop sizes: D4, D6, D8, D10,
            D12, D20 and percentile D100. It&apos;s perfect for board games, Dungeons &amp; Dragons
            and other RPGs, or classroom probability experiments.
          </p>
          <h2>Common Rolls</h2>
          <ul>
            <li><strong>1D20</strong> - attack rolls and ability checks in D&amp;D</li>
            <li><strong>2D6</strong> - Monopoly, Catan and many board games</li>
            <li><strong>4D6</strong> - rolling ability scores (drop the lowest)</li>
            <li><strong>1D100</strong> - percentile rolls and random tables</li>
          </ul>
          <h2>Flip a Coin</h2>
          <p>
            Need a quick yes or no? Flip the coin. The tally keeps count so you can see that heads
            and tails even out over many flips. Every roll and flip uses your browser&apos;s secure
            random number generator.
          </p>
        </>
      }
    >
      <DiceRoller />
    </ToolPage>
  );
}
