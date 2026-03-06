"use client";

import { useEffect } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { clamp } from "@/src/systems/utils/math";

function computeDayCycle(now: Date) {
  const h = now.getHours() + now.getMinutes() / 60;

  const sunrise = 6;  // 6:00
  const sunset = 18;  // 18:00

  let dayLight = 0;
  if (h >= sunrise && h <= sunset) {
    const t = (h - sunrise) / (sunset - sunrise); // 0..1
    dayLight = Math.sin(Math.PI * t); // 0..1..0
  } else {
    dayLight = 0;
  }

  // Phase labels for kid-friendly vibes
  let phase: "morning" | "afternoon" | "evening" | "night" = "afternoon";
  if (h >= 6 && h < 11) phase = "morning";
  else if (h >= 11 && h < 17) phase = "afternoon";
  else if (h >= 17 && h < 20) phase = "evening";
  else phase = "night";

  return { phase, dayLight: clamp(dayLight, 0, 1) };
}

export function useDayNightSync() {
  const setDayCycle = useGameStore((s) => s.setDayCycle);

  useEffect(() => {
    const tick = () => {
      const { phase, dayLight } = computeDayCycle(new Date());
      setDayCycle(phase, dayLight);
    };

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [setDayCycle]);
}
