import WordCounter from "@/components/pages/tools/WordCounter";
import ToolPage from "@/components/tools/ToolPage";
import { toolMetadata } from "@/lib/tools";

export const metadata = toolMetadata("word-counter");

export default function Page() {
  return (
    <ToolPage
      slug="word-counter"
      about={
        <>
          <h2>About Word Counting</h2>
          <p>
            Word counting is essential for various purposes including academic writing, content
            creation, social media posts, and professional documents. Knowing the length of your
            text helps ensure it meets specific requirements.
          </p>
          <h2>What We Count</h2>
          <ul>
            <li><strong>Words:</strong> Using your browser&apos;s language-aware word segmentation</li>
            <li><strong>Characters:</strong> Including spaces, emoji and special characters</li>
            <li><strong>Characters (no spaces):</strong> Excluding spaces, tabs and line breaks</li>
            <li><strong>Sentences and paragraphs:</strong> Paragraphs are separated by a blank line</li>
            <li><strong>Reading time:</strong> Based on an average of 238 words per minute</li>
            <li><strong>Speaking time:</strong> Based on an average of 150 words per minute</li>
          </ul>
          <h2>Keyword Density</h2>
          <p>
            The most frequent meaningful words in your text are listed with how often they appear.
            Common filler words like &ldquo;the&rdquo; and &ldquo;and&rdquo; are ignored. This is
            handy for checking that an article isn&apos;t overusing a word.
          </p>
        </>
      }
    >
      <WordCounter />
    </ToolPage>
  );
}
