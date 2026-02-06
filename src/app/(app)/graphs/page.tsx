"use client";

import { GitGraph, RefreshCw } from 'lucide-react';
import RelationshipGraph, { STORAGE_KEY } from '@/components/graph/RelationshipGraph';

export default function GraphsPage() {
    const handleReset = () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-full bg-[#171516]">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/5 bg-[#171516]">
                <div className="flex items-center gap-3">
                    <div className="bg-[#FC8B28]/10 p-2 rounded-xl">
                        <GitGraph className="w-5 h-5 text-[#FC8B28]" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-white tracking-tight">Data Map</h1>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            {/* Static for now, can be dynamic counts */}
                            12 Tables · 7 Relationships
                        </p>
                    </div>
                </div>

                {/* Reset Button (Header Right) */}
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1E] border border-white/10 rounded-md text-xs text-muted-foreground hover:text-white hover:border-[#FC8B28]/50 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Layout
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-1 w-full h-[calc(100vh-4rem)] p-4">
                <div className="w-full h-full rounded-xl overflow-hidden border border-border/10 bg-[#0a0a0a] shadow-2xl">
                    <RelationshipGraph />
                </div>
            </div>
        </div>
    );
}
