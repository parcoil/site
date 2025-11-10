"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

function WordCounter() {
  const [text, setText] = React.useState("");

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, "").length;
  const lineCount = text.split("\n").length;

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Word Counter</h1>
          <p>Count words, characters, and lines in your text</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Enter your text here..."
              onChange={(e) => setText(e.target.value)}
              value={text}
              className="min-h-32"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 dark:bg-accent/50 bg-accent rounded-lg border dark:border-primary/20 border-secondary">
                <div className="text-2xl font-bold text-blue-600">
                  {wordCount}
                </div>
                <div className="text-sm text-accent-foreground">Words</div>
              </div>
              <div className="text-center p-4 dark:bg-accent/50 bg-accent rounded-lg border dark:border-primary/20 border-secondary">
                <div className="text-2xl font-bold text-green-600">
                  {charCount}
                </div>
                <div className="text-sm text-accent-foreground">Characters</div>
              </div>
              <div className="text-center p-4 dark:bg-accent/50 bg-accent rounded-lg border dark:border-primary/20 border-secondary">
                <div className="text-2xl font-bold text-primary">
                  {charCountNoSpaces}
                </div>
                <div className="text-sm text-accent-foreground">
                  Characters (no spaces)
                </div>
              </div>
              <div className="text-center p-4 dark:bg-accent/50 bg-accent rounded-lg border dark:border-primary/20 border-secondary">
                <div className="text-2xl font-bold text-orange-600">
                  {lineCount}
                </div>
                <div className="text-sm text-accent-foreground">Lines</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WordCounter;
