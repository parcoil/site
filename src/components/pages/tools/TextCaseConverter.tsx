"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Trash } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [lastConversion, setLastConversion] = useState("");

  const convertCase = (type) => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to convert");
      return;
    }

    let result = "";
    setLastConversion(type);

    switch (type) {
      case "uppercase":
        result = inputText.toUpperCase();
        break;
      case "lowercase":
        result = inputText.toLowerCase();
        break;
      case "titlecase":
        result = inputText
          .toLowerCase()
          .split(" ")
          .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(" ");
        break;
      case "sentencecase":
        result = inputText
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case "camelcase":
        result = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
          .replace(/^[A-Z]/, (c) => c.toLowerCase());
        break;
      case "pascalcase":
        result = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
          .replace(/^[a-z]/, (c) => c.toUpperCase());
        break;
      case "snakecase":
        result = inputText
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");
        break;
      case "kebabcase":
        result = inputText
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-]/g, "");
        break;
      case "constantcase":
        result = inputText
          .toUpperCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");
        break;
      case "alternatingcase":
        result = inputText
          .split("")
          .map((char, index) =>
            index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
          )
          .join("");
        break;
      case "inversecase":
        result = inputText
          .split("")
          .map((char) =>
            char === char.toUpperCase()
              ? char.toLowerCase()
              : char.toUpperCase()
          )
          .join("");
        break;
      default:
        result = inputText;
    }

    setOutputText(result);
    posthog.capture("text_case_converted", { conversion_type: type });
  };

  const copyToClipboard = () => {
    if (!outputText) {
      toast.error("No converted text to copy");
      return;
    }

    navigator.clipboard.writeText(outputText);
    toast.success("Copied to clipboard!");
    posthog.capture("text_case_copied", { conversion_type: lastConversion });
  };

  const clearText = () => {
    setInputText("");
    setOutputText("");
    setLastConversion("");
    toast.info("Text cleared");
  };

  const conversionButtons = [
    { name: "UPPERCASE", value: "uppercase" },
    { name: "lowercase", value: "lowercase" },
    { name: "Title Case", value: "titlecase" },
    { name: "Sentence case", value: "sentencecase" },
    { name: "camelCase", value: "camelcase" },
    { name: "PascalCase", value: "pascalcase" },
    { name: "snake_case", value: "snakecase" },
    { name: "kebab-case", value: "kebabcase" },
    { name: "CONSTANT_CASE", value: "constantcase" },
    { name: "aLtErNaTiNg cAsE", value: "alternatingcase" },
    { name: "InVeRsE CaSe", value: "inversecase" },
  ];

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Text Case Converter</CardTitle>
          <CardDescription className="text-center">
            Convert text between different cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="input-text" className="text-sm font-medium">
              Enter your text:
            </label>
            <Textarea
              id="input-text"
              placeholder="Type or paste your text here..."
              className="min-h-[120px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {conversionButtons.map((button) => (
              <Button
                key={button.value}
                variant={
                  lastConversion === button.value ? "default" : "outline-solid"
                }
                size="sm"
                onClick={() => convertCase(button.value)}
                className="text-xs sm:text-sm"
              >
                {button.name}
              </Button>
            ))}
          </div>

          {outputText && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="output-text" className="text-sm font-medium">
                  Converted text:
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearText}
                    className="flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                id="output-text"
                className="min-h-[120px]"
                value={outputText}
                readOnly
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <h3 className="font-medium">Tips:</h3>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li>Use Title Case for headings and titles</li>
              <li>Use camelCase for JavaScript variables</li>
              <li>Use snake_case for Python variables</li>
              <li>Use kebab-case for CSS classes and HTML attributes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
