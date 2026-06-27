"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function TimerBadge({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  let colorClass = "bg-success/20 text-success border-success/30";
  let pulseClass = "";

  if (minutes >= 10) {
    colorClass = "bg-error/20 text-error border-error/50";
    pulseClass = "animate-pulse";
  } else if (minutes >= 5) {
    colorClass = "bg-warning/20 text-warning border-warning/50";
  }

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-sm font-bold ${colorClass} ${pulseClass}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}
