"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep, className, ...props }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)} {...props}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step} className="flex flex-col items-center relative z-10">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2",
                isCompleted
                  ? "bg-primary border-primary text-white"
                  : isCurrent
                  ? "border-primary text-primary bg-background"
                  : "border-muted text-muted-foreground bg-background"
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span
              className={cn(
                "absolute top-10 text-xs font-medium whitespace-nowrap",
                isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
      
      {/* Connecting Lines */}
      <div className="absolute left-0 top-4 -z-10 w-full h-[2px] bg-muted px-4">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} 
        />
      </div>
    </div>
  );
}
