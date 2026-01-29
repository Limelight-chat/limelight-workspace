"use client";

import EnhancedFileList from "@/components/enhanced-file-list";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function LibraryPage() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress animation
    const timer = setTimeout(() => setProgress(100), 100);

    // Trigger fade out after 6 seconds
    const dismissTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setIsVisible(false), 500); // Wait for fade out
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => setIsVisible(false), 500);
  };

  if (!isVisible) return (
    <div className="container mx-auto p-6 max-w-6xl relative min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Your Data Library</h1>
        <p className="text-muted-foreground">
          Explore your uploaded files with detailed metadata, column classifications, and relationship analysis
        </p>
      </div>

      <EnhancedFileList />
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl relative min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Your Data Library</h1>
        <p className="text-muted-foreground">
          Explore your uploaded files with detailed metadata, column classifications, and relationship analysis
        </p>
      </div>

      <EnhancedFileList />

      <div className={`fixed bottom-6 right-6 z-50 w-full max-w-md transition-all duration-500 ${isFadingOut ? 'opacity-0 translate-y-2' : 'animate-in slide-in-from-bottom-5 fade-in'}`}>
        <Alert className="bg-background/80 backdrop-blur-sm border-orange-500/20 shadow-lg relative overflow-hidden pr-8">
          <Info className="h-4 w-4 text-orange-500" />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertTitle className="text-orange-500 font-semibold mb-2">You probably won’t need this page</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            This view is used internally to inspect foreign-key graphs and schema structure that power Limelight’s reasoning engine.
          </AlertDescription>
          {/* Progress Line */}
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-[6000ms] ease-linear"
            style={{ width: `${progress}%` }}
          />
        </Alert>
      </div>
    </div>
  );
}
