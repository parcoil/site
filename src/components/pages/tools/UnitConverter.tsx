"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function UnitConverter() {
  const [input, setInput] = React.useState("");
  const [fromUnit, setFromUnit] = React.useState("m");
  const [toUnit, setToUnit] = React.useState("cm");
  const [result, setResult] = React.useState("");

  const convert = () => {
    const value = parseFloat(input);
    if (isNaN(value)) {
      setResult("Invalid input");
      return;
    }

    // Simple conversions (meters to other units)
    const conversions: { [key: string]: number } = {
      mm: 1000,
      cm: 100,
      m: 1,
      km: 0.001,
      in: 39.3701,
      ft: 3.28084,
      yd: 1.09361,
      mi: 0.000621371,
    };

    const inMeters = value / conversions[fromUnit];
    const converted = inMeters * conversions[toUnit];
    setResult(converted.toFixed(4));
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Unit Converter</h1>
          <p>Convert between different units of length</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Input
                type="number"
                placeholder="Value"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">Millimeters</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="m">Meters</SelectItem>
                  <SelectItem value="km">Kilometers</SelectItem>
                  <SelectItem value="in">Inches</SelectItem>
                  <SelectItem value="ft">Feet</SelectItem>
                  <SelectItem value="yd">Yards</SelectItem>
                  <SelectItem value="mi">Miles</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-center">to</span>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">Millimeters</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="m">Meters</SelectItem>
                  <SelectItem value="km">Kilometers</SelectItem>
                  <SelectItem value="in">Inches</SelectItem>
                  <SelectItem value="ft">Feet</SelectItem>
                  <SelectItem value="yd">Yards</SelectItem>
                  <SelectItem value="mi">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={convert}>Convert</Button>
            <Input placeholder="Result" value={result} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnitConverter;