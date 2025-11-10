"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function URLEncoder() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  const handleEncode = () => {
    try {
      setOutput(encodeURIComponent(input));
    } catch (error) {
      setOutput("Error encoding URL");
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (error) {
      setOutput("Error decoding URL");
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">URL Encoder/Decoder</h1>
          <p>Encode or decode URLs for safe transmission</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Enter URL to encode/decode"
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <div className="flex gap-4">
              <Button onClick={handleEncode}>Encode</Button>
              <Button onClick={handleDecode}>Decode</Button>
            </div>
            <Textarea placeholder="Result" value={output} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default URLEncoder;