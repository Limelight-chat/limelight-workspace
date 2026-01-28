"use client";

import EnhancedFileList from "@/components/enhanced-file-list";

export default function LibraryPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Your Data Library</h1>
        <p className="text-muted-foreground">
          Explore your uploaded files with detailed metadata, column classifications, and relationship analysis
        </p>
      </div>

      <EnhancedFileList />
    </div>
  );
}
