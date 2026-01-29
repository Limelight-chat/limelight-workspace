"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface UploadItem {
    id: string;
    name: string;
    progress: number;
    status: "uploading" | "completed" | "error";
    jobId?: string;
    error?: string;
}

export default function FileUpload06() {
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const filePickerRef = useRef<HTMLInputElement>(null);

    const openFilePicker = () => {
        filePickerRef.current?.click();
    };

    const handleFiles = async (files: FileList) => {
        const fileArray = Array.from(files);

        // Filter for CSV and Excel files
        const validFiles = fileArray.filter(file =>
            file.name.endsWith('.csv') ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        );

        if (validFiles.length === 0) {
            alert('Please upload CSV or Excel files only');
            return;
        }

        // Add files to upload list
        const newUploads: UploadItem[] = validFiles.map(file => ({
            id: Math.random().toString(36).substring(2, 11),
            name: file.name,
            progress: 0,
            status: "uploading" as const,
        }));

        setUploads(prev => [...prev, ...newUploads]);

        // Upload each file
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const uploadItem = newUploads[i];

            try {
                // Start upload
                setUploads(prev => prev.map(u =>
                    u.id === uploadItem.id ? { ...u, progress: 10 } : u
                ));

                const result = await api.uploadFile(file);

                // Update with job ID
                setUploads(prev => prev.map(u =>
                    u.id === uploadItem.id ? { ...u, progress: 30, jobId: result.job_id } : u
                ));

                // Poll for job status
                let attempts = 0;
                const maxAttempts = 60; // 60 seconds max

                const pollInterval = setInterval(async () => {
                    attempts++;

                    try {
                        const status = await api.getJobStatus(result.job_id);

                        if (status.status === 'completed') {
                            clearInterval(pollInterval);
                            setUploads(prev => prev.map(u =>
                                u.id === uploadItem.id ? { ...u, progress: 100, status: "completed" } : u
                            ));
                            // Dispatch event to notify library page to refresh
                            window.dispatchEvent(new CustomEvent('fileUploaded'));
                        } else if (status.status === 'failed') {
                            clearInterval(pollInterval);
                            setUploads(prev => prev.map(u =>
                                u.id === uploadItem.id ? {
                                    ...u,
                                    status: "error",
                                    error: status.error || 'Upload failed'
                                } : u
                            ));
                        } else if (status.status === 'processing') {
                            // Update progress based on stage
                            const progressMap: Record<string, number> = {
                                'starting': 40,
                                'parsing': 50,
                                'inserting': 70,
                                'generating_embeddings': 85,
                                'generating_description': 95,
                            };
                            const progress = progressMap[status.progress?.stage || 'starting'] || 50;
                            setUploads(prev => prev.map(u =>
                                u.id === uploadItem.id ? { ...u, progress } : u
                            ));
                        }

                        if (attempts >= maxAttempts) {
                            clearInterval(pollInterval);
                            setUploads(prev => prev.map(u =>
                                u.id === uploadItem.id ? {
                                    ...u,
                                    status: "error",
                                    error: 'Upload timeout'
                                } : u
                            ));
                        }
                    } catch (_error) {
                        clearInterval(pollInterval);
                        setUploads(prev => prev.map(u =>
                            u.id === uploadItem.id ? {
                                ...u,
                                status: "error",
                                error: 'Failed to check status'
                            } : u
                        ));
                    }
                }, 1000);

            } catch (_error: unknown) {
                setUploads(prev => prev.map(u =>
                    u.id === uploadItem.id ? {
                        ...u,
                        status: "error",
                        error: 'Upload failed'
                    } : u
                ));
            }
        }
    };

    const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            handleFiles(selectedFiles);
        }
    };

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const onDropFiles = (event: React.DragEvent) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles) {
            handleFiles(droppedFiles);
        }
    };

    const removeUploadById = (id: string) => {
        setUploads(uploads.filter((file) => file.id !== id));
    };

    const activeUploads = uploads.filter((file) => file.status === "uploading");
    const completedUploads = uploads.filter((file) => file.status === "completed");
    const errorUploads = uploads.filter((file) => file.status === "error");

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-y-6">
            <Card
                className="group flex max-h-[200px] w-full flex-col items-center justify-center gap-4 py-8 border-dashed text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                onDragOver={onDragOver}
                onDrop={onDropFiles}
                onClick={openFilePicker}
            >
                <div className="grid space-y-3">
                    <div className="flex items-center gap-x-2 text-muted-foreground">
                        <Upload className="size-5" />
                        <div>
                            Drop files here or{" "}
                            <Button
                                variant="link"
                                className="text-primary p-0 h-auto font-normal"
                                onClick={openFilePicker}
                            >
                                browse files
                            </Button>{" "}
                            to add
                        </div>
                    </div>
                </div>
                <input
                    ref={filePickerRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    multiple
                    onChange={onFileInputChange}
                />
                <span className="text-base/6 text-muted-foreground group-disabled:opacity-50 mt-2 block sm:text-xs">
                    Supported: CSV, Excel (XLSX, XLS)
                </span>
            </Card>

            <div className="flex flex-col gap-y-4">
                {activeUploads.length > 0 && (
                    <div>
                        <h2 className="text-foreground text-lg flex items-center font-mono font-normal uppercase sm:text-xs mb-4">
                            <Loader2 className="size-4 mr-1 animate-spin" />
                            Uploading
                        </h2>
                        <div className="-mt-2 divide-y">
                            {activeUploads.map((file) => (
                                <div key={file.id} className="group flex items-center py-4">
                                    <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                                        <FileText className="inline size-4 group-hover:hidden" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hidden size-4 group-hover:inline p-0 h-auto"
                                            onClick={() => removeUploadById(file.id)}
                                            aria-label="Cancel"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col w-full mb-1">
                                        <div className="flex justify-between gap-2">
                                            <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                                                {file.name}
                                            </span>
                                            <span className="text-muted-foreground text-sm tabular-nums">
                                                {file.progress}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={file.progress}
                                            className="mt-1 h-2 min-w-64"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(activeUploads.length > 0 && (completedUploads.length > 0 || errorUploads.length > 0)) && (
                    <Separator className="my-0" />
                )}

                {errorUploads.length > 0 && (
                    <div>
                        <h2 className="text-foreground text-lg flex items-center font-mono font-normal uppercase sm:text-xs mb-4">
                            <AlertCircle className="mr-1 size-4 text-red-500" />
                            Failed
                        </h2>
                        <div className="-mt-2 divide-y">
                            {errorUploads.map((file) => (
                                <div key={file.id} className="group flex items-center py-4">
                                    <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-red-500/10 border-red-500/20">
                                        <AlertCircle className="inline size-4 text-red-500" />
                                    </div>
                                    <div className="flex flex-col w-full mb-1">
                                        <div className="flex justify-between gap-2">
                                            <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                                                {file.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-4 p-0 h-auto"
                                                onClick={() => removeUploadById(file.id)}
                                                aria-label="Remove"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                        <span className="text-xs text-red-400">{file.error}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(errorUploads.length > 0 && completedUploads.length > 0) && (
                    <Separator className="my-0" />
                )}

                {completedUploads.length > 0 && (
                    <div>
                        <h2 className="text-foreground text-lg flex items-center font-mono font-normal uppercase sm:text-xs mb-4">
                            <CheckCircle className="mr-1 size-4" />
                            Finished
                        </h2>
                        <div className="-mt-2 divide-y">
                            {completedUploads.map((file) => (
                                <div key={file.id} className="group flex items-center py-4">
                                    <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                                        <FileText className="inline size-4 group-hover:hidden" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hidden size-4 group-hover:inline p-0 h-auto"
                                            onClick={() => removeUploadById(file.id)}
                                            aria-label="Remove"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col w-full mb-1">
                                        <div className="flex justify-between gap-2">
                                            <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                                                {file.name}
                                            </span>
                                            <span className="text-muted-foreground text-sm tabular-nums">
                                                {file.progress}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={file.progress}
                                            className="mt-1 h-2 min-w-64"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
