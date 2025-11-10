"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function JSONFormatter() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState("");

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (err) {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(input);
      setError("Valid JSON");
    } catch (err) {
      setError("Invalid JSON");
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">JSON Formatter</h1>
          <p>Format, validate, and minify JSON data</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Enter JSON to format"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              className="font-mono"
            />
            <div className="flex gap-4">
              <Button onClick={handleFormat}>Format</Button>
              <Button onClick={handleMinify}>Minify</Button>
              <Button onClick={handleValidate}>Validate</Button>
            </div>
            {error && (
              <div className={`text-sm ${error === "Valid JSON" ? "text-green-600" : "text-red-600"}`}>
                {error}
              </div>
            )}
            <Textarea
              placeholder="Result"
              value={output}
              readOnly
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default JSONFormatter;