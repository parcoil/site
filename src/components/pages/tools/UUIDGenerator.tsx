"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function UUIDGenerator() {
  const [uuid, setUuid] = React.useState("");

  const generateUUID = () => {
    const newUuid = crypto.randomUUID();
    setUuid(newUuid);
  };

  const copyToClipboard = async () => {
    if (uuid) {
      await navigator.clipboard.writeText(uuid);
      // Could add a toast notification here
    }
  };

  React.useEffect(() => {
    generateUUID();
  }, []);

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">UUID Generator</h1>
          <p>Generate random UUIDs (Universally Unique Identifiers)</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button onClick={generateUUID}>Generate New UUID</Button>
              <Button onClick={copyToClipboard} disabled={!uuid}>Copy to Clipboard</Button>
            </div>
            <Input
              value={uuid}
              readOnly
              className="font-mono text-sm"
              placeholder="Generated UUID will appear here"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UUIDGenerator;