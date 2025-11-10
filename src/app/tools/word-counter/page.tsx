import WordCounter from "@/components/pages/tools/WordCounter";

export const metadata = {
  title: "Word Counter Tool | Count Words, Characters, and Lines Online",
  description:
    "Free online word counter tool. Count words, characters (with and without spaces), and lines in your text instantly.",
  keywords: [
    "word counter",
    "character counter",
    "line counter",
    "text counter",
    "word count tool",
    "character count",
    "online counter",
  ],
  openGraph: {
    title: "Word Counter Tool",
    description: "Free online word counter to count words, characters, and lines.",
    type: "website",
    locale: "en_US",
  },
};

export default function WordCounterPage() {
  return (
    <main className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Word Counter
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Count words, characters, and lines in your text with real-time updates.
          Perfect for writers, students, and anyone who needs to track text statistics.
        </p>
      </div>

      <main>
        <WordCounter />
      </main>

      <section className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About Word Counting</h2>
        <p>
          Word counting is essential for various purposes including academic writing,
          content creation, social media posts, and professional documents. Knowing
          the length of your text helps ensure it meets specific requirements.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">What We Count</h2>
        <ul>
          <li><strong>Words:</strong> Separated by spaces or punctuation</li>
          <li><strong>Characters:</strong> Including spaces and special characters</li>
          <li><strong>Characters (no spaces):</strong> Excluding spaces</li>
          <li><strong>Lines:</strong> Separated by line breaks</li>
        </ul>
      </section>
    </main>
  );
}