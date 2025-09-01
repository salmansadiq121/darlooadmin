"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Users, Package, Settings } from "lucide-react";

export default function AdvancedLoader({
  message = "Loading admin dashboard...",
  showCountdown = false,
  redirectPath = "/",
  duration = 5,
}) {
  const router = useRouter();
  const [count, setCount] = useState(duration);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    { icon: BarChart3, text: "Loading analytics" },
    { icon: Users, text: "Fetching customer data" },
    { icon: Package, text: "Loading inventory" },
    { icon: Settings, text: "Preparing dashboard" },
  ];

  useEffect(() => {
    if (showCountdown) {
      const counter = setInterval(() => {
        setCount((prevVal) => {
          if (prevVal === 0) {
            router.push(redirectPath);
            clearInterval(counter);
          }
          return prevVal - 1;
        });
      }, 1000);

      return () => clearInterval(counter);
    }
  }, [count, router, showCountdown, redirectPath]);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-red-50 to-red-100">
      <div className="flex flex-col items-center justify-center gap-8 p-8 max-w-md mx-auto">
        {/* Brand Logo Area */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-red-600 mb-2 font-serif">
            Darloo
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            ECOMMERCE MANAGEMENT
          </p>
        </div>

        {/* Multi-layered Loader Animation */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulsing ring */}
          <div className="absolute w-32 h-32 rounded-full border-2 border-red-600/20 pulse-ring"></div>
          <div
            className="absolute w-32 h-32 rounded-full border-2 border-red-600/20 pulse-ring"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Rotating dots */}
          <div className="absolute w-24 h-24 rotate-dots">
            <div className="absolute w-3 h-3 bg-red-600 rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-secondary rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
            <div className="absolute w-3 h-3 bg-red-600 rounded-full bottom-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-secondary rounded-full top-1/2 left-0 transform -translate-y-1/2"></div>
          </div>

          {/* Center icon with floating animation */}
          <div className="relative z-10 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center float shadow-lg">
            <CurrentIcon className="w-8 h-8 text-white fade-pulse" />
          </div>
        </div>

        {/* Loading Steps */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground fade-pulse">
            {loadingSteps[currentStep].text}
          </p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-secondary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex space-x-2">
          {loadingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-red-600 scale-125"
                  : index < currentStep
                  ? "bg-secondary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Countdown (if enabled) */}
        {showCountdown && (
          <div className="text-center space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">
              Redirecting in {count} seconds
            </p>
            <div className="w-16 h-16 mx-auto relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 64 64"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (count / duration)}`}
                  className="text-red-600 transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-red-600">{count}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
