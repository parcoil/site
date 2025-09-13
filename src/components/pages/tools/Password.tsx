"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Shield } from "lucide-react";
import posthog from "posthog-js";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(true);
  const [hasUppercase, setHasUppercase] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_-+=<>?";

  useEffect(() => {
    generatePassword();
  }, []);

  useEffect(() => {
    generatePassword();
  }, [length, hasNumbers, hasSymbols, hasUppercase]);

  const generatePassword = () => {
    let characters = lowercaseChars;
    let mustInclude = [];

    if (hasUppercase) {
      characters += uppercaseChars;
      mustInclude.push(
        uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
      );
    }
    if (hasNumbers) {
      characters += numberChars;
      mustInclude.push(
        numberChars.charAt(Math.floor(Math.random() * numberChars.length))
      );
    }
    if (hasSymbols) {
      characters += symbolChars;
      mustInclude.push(
        symbolChars.charAt(Math.floor(Math.random() * symbolChars.length))
      );
    }

    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      generatedPassword += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    if (mustInclude.length > 0) {
      let tempPassword = generatedPassword.split("");
      mustInclude.forEach((char, index) => {
        tempPassword[index] = char;
      });

      for (let i = tempPassword.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempPassword[i], tempPassword[j]] = [tempPassword[j], tempPassword[i]];
      }

      generatedPassword = tempPassword.join("");
    }

    setPassword(generatedPassword);
    posthog.capture("password_generated", {
      length,
      hasNumbers,
      hasSymbols,
      hasUppercase,
    });
  };

  const calculatePasswordStrength = () => {
    if (!password) return "Weak";

    let poolSize = 26;
    if (hasUppercase) poolSize += 26;
    if (hasNumbers) poolSize += 10;
    if (hasSymbols) poolSize += 16;

    const entropy = Math.log2(poolSize) * password.length;

    let deductions = 0;

    const charCounts: Record<string, number> = {};
    for (const char of password) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }

    Object.values(charCounts).forEach((count) => {
      if (count > 2) deductions += count - 2;
    });

    for (let i = 0; i < password.length - 2; i++) {
      const charCode1 = password.charCodeAt(i);
      const charCode2 = password.charCodeAt(i + 1);
      const charCode3 = password.charCodeAt(i + 2);

      if (
        (charCode1 + 1 === charCode2 && charCode2 + 1 === charCode3) ||
        (charCode1 - 1 === charCode2 && charCode2 - 1 === charCode3)
      ) {
        deductions += 2;
      }
    }

    const adjustedEntropy = Math.max(
      entropy * (1 - Math.min(deductions / password.length / 3, 0.3)),
      0
    );

    if (adjustedEntropy < 28) return "Weak";
    if (adjustedEntropy < 60) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    const strength = calculatePasswordStrength();
    if (strength === "Weak") return "text-red-500";
    if (strength === "Medium") return "text-yellow-500";
    return "text-green-500";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    posthog.capture("password_copied", { length });
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-center">Secure Password Generator</CardTitle>
        <CardDescription className="text-center">
          Create strong, unique passwords to protect your online accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password-length">Password Length</Label>
            <span className="text-sm font-medium">{length} characters</span>
          </div>
          <Slider
            id="password-length"
            value={[length]}
            onValueChange={(values) => setLength(values[0])}
            min={4}
            max={32}
            step={1}
            aria-label="Adjust password length"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="numbers" className="cursor-pointer">
              Include Numbers (0-9)
            </Label>
            <Switch
              id="numbers"
              checked={hasNumbers}
              onCheckedChange={setHasNumbers}
              aria-label="Toggle numbers in password"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="symbols" className="cursor-pointer">
              Include Symbols (!@#$%^&*)
            </Label>
            <Switch
              id="symbols"
              checked={hasSymbols}
              onCheckedChange={setHasSymbols}
              aria-label="Toggle symbols in password"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="uppercase" className="cursor-pointer">
              Include Uppercase Letters (A-Z)
            </Label>
            <Switch
              id="uppercase"
              checked={hasUppercase}
              onCheckedChange={setHasUppercase}
              aria-label="Toggle uppercase letters in password"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-background/70 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <Label className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Your Password:
            </Label>
            <span className={`text-sm font-medium ${getStrengthColor()}`}>
              {calculatePasswordStrength()}
            </span>
          </div>
          <div className="relative">
            <div
              className="relative cursor-pointer group"
              onClick={copyToClipboard}
              title="Click to copy"
            >
              <Input
                readOnly
                value={password}
                className="font-mono text-center pr-20 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Generated password (click to copy)"
              />
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5 flex items-center justify-center text-xs font-medium transition-opacity"></div>
            </div>
            <div className="absolute right-0 top-0 h-full flex items-center space-x-1 pr-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={generatePassword}
                aria-label="Generate new password"
                title="Regenerate password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                aria-label="Copy password to clipboard"
                title={copySuccess ? "Copied!" : "Copy to clipboard"}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {copySuccess && (
            <p className="text-green-500 text-xs text-center mt-1">
              Password copied to clipboard!
            </p>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <h2 className="font-medium">Password Tips:</h2>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>Use a different password for each account</li>
            <li>Longer passwords (12+ characters) provide better security</li>
            <li>Include a mix of letters, numbers, and symbols</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
