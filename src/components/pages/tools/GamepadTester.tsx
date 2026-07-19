"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad, AlertCircle } from "lucide-react";

interface GamepadState {
  id: string;
  index: number;
  connected: boolean;
  mapping: string;
  axes: number[];
  buttons: { pressed: boolean; touched: boolean; value: number }[];
}

const BUTTON_LABELS: Record<string, string[]> = {
  standard: [
    "A",
    "B",
    "X",
    "Y",
    "LB",
    "RB",
    "LT",
    "RT",
    "Back",
    "Start",
    "LS",
    "RS",
    "Up",
    "Down",
    "Left",
    "Right",
    "Home",
  ],
  default: [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
  ],
};

function getButtonLabel(mapping: string, index: number): string {
  const labels = BUTTON_LABELS[mapping] || BUTTON_LABELS.default;
  return labels[index] || `${index}`;
}

function AxisStick({
  x,
  y,
  label,
}: {
  x: number;
  y: number;
  label: string;
}) {
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  const px = ((clamp(x) + 1) / 2) * 100;
  const py = ((clamp(y) + 1) / 2) * 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div className="relative w-24 h-24 rounded-full border bg-muted/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-px h-full bg-border" />
          <div className="absolute w-full h-px bg-border" />
        </div>
        <div
          className="absolute w-3 h-3 rounded-full bg-primary -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
          style={{ left: `${px}%`, top: `${py}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono">
        X: {clamp(x).toFixed(2)} Y: {clamp(y).toFixed(2)}
      </span>
    </div>
  );
}

function ButtonIndicator({
  pressed,
  label,
}: {
  pressed: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-md border flex items-center justify-center text-xs font-medium transition-colors ${
          pressed
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted/50 text-muted-foreground border-border"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export default function GamepadTester() {
  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const [selectedGamepad, setSelectedGamepad] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const pollGamepads = useCallback(() => {
    const rawGamepads = navigator.getGamepads();
    const connected: GamepadState[] = [];

    for (let i = 0; i < rawGamepads.length; i++) {
      const gp = rawGamepads[i];
      if (gp) {
        connected.push({
          id: gp.id,
          index: gp.index,
          connected: gp.connected,
          mapping: gp.mapping || "standard",
          axes: Array.from(gp.axes),
          buttons: Array.from(gp.buttons).map((b) => ({
            pressed: b.pressed,
            touched: b.touched,
            value: b.value,
          })),
        });
      }
    }

    setGamepads(connected);

    if (selectedGamepad !== null) {
      const stillExists = connected.some((g) => g.index === selectedGamepad);
      if (!stillExists) {
        setSelectedGamepad(connected.length > 0 ? connected[0].index : null);
      }
    }

    rafRef.current = requestAnimationFrame(pollGamepads);
  }, [selectedGamepad]);

  useEffect(() => {
    const handleConnect = (e: GamepadEvent) => {
      setGamepads((prev) => {
        const exists = prev.some((g) => g.index === e.gamepad.index);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: e.gamepad.id,
            index: e.gamepad.index,
            connected: true,
            mapping: e.gamepad.mapping || "standard",
            axes: Array.from(e.gamepad.axes),
            buttons: Array.from(e.gamepad.buttons).map((b) => ({
              pressed: b.pressed,
              touched: b.touched,
              value: b.value,
            })),
          },
        ];
      });
    };

    const handleDisconnect = (e: GamepadEvent) => {
      setGamepads((prev) => prev.filter((g) => g.index !== e.gamepad.index));
      setSelectedGamepad((prev) =>
        prev === e.gamepad.index ? null : prev
      );
    };

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    rafRef.current = requestAnimationFrame(pollGamepads);

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [pollGamepads]);

  const activeGamepad =
    gamepads.find((g) => g.index === selectedGamepad) ?? gamepads[0] ?? null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Gamepad className="h-5 w-5" />
          Gamepad Tester
        </CardTitle>
        <CardDescription className="text-center">
          Connect a gamepad and press any button to test it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {gamepads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p className="text-center">
              No gamepads detected. Connect a controller via USB or Bluetooth
              and press a button.
            </p>
          </div>
        ) : (
          <>
            {gamepads.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {gamepads.map((gp) => (
                  <Badge
                    key={gp.index}
                    variant={
                      activeGamepad?.index === gp.index ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedGamepad(gp.index)}
                  >
                    Gamepad {gp.index + 1}
                  </Badge>
                ))}
              </div>
            )}

            {activeGamepad && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {activeGamepad.mapping === "standard"
                        ? "Standard"
                        : "Non-standard"}
                    </Badge>
                    <span className="text-muted-foreground truncate max-w-xs">
                      {activeGamepad.id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 justify-items-center">
                  {activeGamepad.axes.length >= 2 && (
                    <AxisStick
                      x={activeGamepad.axes[0] ?? 0}
                      y={activeGamepad.axes[1] ?? 0}
                      label="Left Stick"
                    />
                  )}
                  {activeGamepad.axes.length >= 4 && (
                    <AxisStick
                      x={activeGamepad.axes[2] ?? 0}
                      y={activeGamepad.axes[3] ?? 0}
                      label="Right Stick"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-center">
                    Buttons
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {activeGamepad.buttons.map((btn, i) => (
                      <ButtonIndicator
                        key={i}
                        pressed={btn.pressed}
                        label={getButtonLabel(activeGamepad.mapping, i)}
                      />
                    ))}
                  </div>
                </div>

                {activeGamepad.axes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-center">
                      Axes (Raw Values)
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {activeGamepad.axes.map((val, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <span className="text-muted-foreground">
                            Axis {i}
                          </span>
                          <span>{val.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeGamepad.buttons.some((b) => b.touched) && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-center">
                      Touch (Analog)
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {activeGamepad.buttons.map((btn, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <span className="text-muted-foreground">
                            {getButtonLabel(activeGamepad.mapping, i)}
                          </span>
                          <span>{btn.value.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
