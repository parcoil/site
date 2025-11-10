"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function hashString(message: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function HashGenerator() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [algorithm, setAlgorithm] = React.useState("SHA-256");

  const handleGenerate = async () => {
    if (!input) return;
    try {
      const hash = await hashString(input, algorithm.replace('-', ''));
      setOutput(hash);
    } catch (error) {
      setOutput("Error generating hash");
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Hash Generator</h1>
          <p>Generate cryptographic hashes from text</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Enter text to hash"
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <div className="flex gap-4 items-center">
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA-256">SHA-256</SelectItem>
                  <SelectItem value="SHA-384">SHA-384</SelectItem>
                  <SelectItem value="SHA-512">SHA-512</SelectItem>
                  <SelectItem value="SHA-1">SHA-1</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate}>Generate Hash</Button>
            </div>
            <Textarea
              placeholder="Hash result"
              value={output}
              readOnly
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HashGenerator;