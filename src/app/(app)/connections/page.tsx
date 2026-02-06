"use client";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import docsIcon from "@/assets/icons/docs.png";
import excelIcon from "@/assets/icons/excel.png";
import sheetsIcon from "@/assets/icons/sheets.png";
import driveIcon from "@/assets/icons/google-drive.png";
import dropboxIcon from "@/assets/icons/dropbox.png";
import slackIcon from "@/assets/icons/slack.png";
import databaseIcon from "@/assets/icons/database.png";
import jiraIcon from "@/assets/icons/jira.png";
import folderIcon from "@/assets/icons/open-folder.png";
import githubIcon from "@/assets/icons/github-sign.png";
import teamsIcon from "@/assets/icons/teams.png";
import pdfIcon from "@/assets/icons/pdf.png";
import officeIcon from "@/assets/icons/office.png";
import notionIcon from "@/assets/icons/notion.png";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import FileUpload06 from "@/components/file-upload-06";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Table {
  id: string;
  table_name: string;
  original_filename: string;
  uploaded_at: string;
  row_count?: number;
}

const ICONS = {
  docs: docsIcon.src,
  excel: excelIcon.src,
  sheets: sheetsIcon.src,
  drive: driveIcon.src,
  drop: dropboxIcon.src,
  slack: slackIcon.src,
  data: databaseIcon.src,
  jira: jiraIcon.src,
  github: githubIcon.src,
  folder: folderIcon.src,
  teams: teamsIcon.src,
  pdf: pdfIcon.src,
  office: officeIcon.src,
  notion: notionIcon.src,
} as const;

const Data = [
  {
    id: 1,
    icons: ["drive", "sheets", "docs"],
    title: "Google Drive",
    description:
      "Connect to Google Drive to search, analyze, and query Sheets and Docs for instant insights.",
    isConnected: false,
    isAvailable: true,
  },
  {
    id: 2,
    icons: ["office", "excel", "word"],
    title: "Microsoft Office",
    description:
      "Integrate Excel and Word to query documents and analyze spreadsheets directly.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 3,
    icons: ["data"],
    title: "Tally",
    description:
      "Sync Tally data for financial reports, analytics, and business intelligence.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 4,
    icons: ["notion"],
    title: "Notion",
    description:
      "Search and query your Notion pages and databases for organized insights.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 5,
    icons: ["drop"],
    title: "Dropbox",
    description:
      "Access, search, and analyze files stored in your Dropbox seamlessly.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 6,
    icons: ["slack"],
    title: "Slack",
    description:
      "Query Slack conversations and shared files to surface knowledge instantly.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 7,
    icons: ["teams"],
    title: "Microsoft Teams",
    description:
      "Connect Teams chats and files to uncover collaboration insights.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 8,
    icons: ["github"],
    title: "GitHub",
    description:
      "Search repositories, issues, and documentation for fast developer insights.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 9,
    icons: ["jira"],
    title: "Jira",
    description:
      "Integrate Jira to analyze tasks, sprints, and project management data.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 10,
    icons: ["data"],
    title: "Database",
    description:
      "More databases coming soon. Contact support to request your preferred database.",
    isConnected: false,
    isAvailable: false,
  },
];

export default function Database() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion UI State
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTables();
      setTables(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    // Listen for file upload events
    const handleFileUploaded = () => {
      fetchTables();
    };

    window.addEventListener('fileUploaded', handleFileUploaded);

    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, []);

  const confirmDelete = async () => {
    if (!deleteTableId) return;

    try {
      setIsDeleting(true);
      await api.deleteTable(deleteTableId);
      setTables(tables.filter(t => t.id !== deleteTableId));
      setDeleteTableId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <div className="flex flex-1 flex-col gap-6 lg:gap-6 p-4">

          {/* Row 1: Your files */}
          <div className="sm:max-h-none overflow-x-auto sm:overflow-visible pr-2 bg-[#191919] border border-[#2a2a2a] rounded-xl p-6">
            <h1 className="text-primary font-medium text-xl mb-4">Your Files</h1>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : tables.length === 0 ? (
              <div className="text-sm text-muted-foreground">No files added yet.</div>
            ) : (
              <div className="grid gap-3">
                {tables.map((table) => (
                  <Card key={table.id} className="p-3 bg-[#232323] border-[#2f2e2e]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-content-center rounded border border-[#2f2e2e] bg-[#363535]">
                          <FileText className="size-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{table.original_filename}</h3>
                          <p className="text-xs text-muted-foreground">
                            {table.row_count ? `${table.row_count} rows` : ""}
                            {table.uploaded_at && ` • ${new Date(table.uploaded_at).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTableId(table.id)}
                        aria-label="Delete file"
                        className="hover:bg-[#363535]"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Row 2: Upload Files */}
          <div className="pr-2 bg-[#191919] border border-[#2a2a2a] rounded-xl md:min-h-min p-6">
            <h1 className="text-primary font-medium text-xl mb-4">Upload Files to Folder</h1>
            <FileUpload06 />
          </div>

          {/* Row 3: Connect Databases */}
          <div className="sm:max-h-none overflow-x-auto overflow-y-hidden sm:overflow-visible pr-2 bg-[#191919] border border-[#2a2a2a] rounded-xl p-6">
            <h1 className="text-primary font-medium text-xl mb-4">Connect Databases</h1>
            <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] grid-rows-2 gap-6 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:auto-rows-fr">
              {Data.map((item) => {
                const iconKeys = item.icons || [];
                const iconSrcs = iconKeys.map((key) => (ICONS as Record<string, string>)[key] || ICONS.data);

                return (
                  <div
                    key={item.id}
                    className="relative flex h-full min-h-[200px] flex-col items-start rounded-xl border border-[#2f2e2e] bg-[#232323] p-6 pb-6 sm:pb-20 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-4 flex h-10 items-center justify-center gap-2 rounded-md bg-[#363535] px-2">
                      {iconSrcs.map((src, idx) => (
                        <Image key={idx} src={src} alt={item.title} width={24} height={24} className="h-6 w-6 object-contain" />
                      ))}
                    </div>
                    <div className="mb-1 text-base font-medium">{item.title}</div>
                    <div className="text-xs leading-snug text-muted-foreground text-left">{item.description}</div>


                    <Button
                      className={`bg-[#FF7D0B] text-black rounded-md ml-auto mt-4 w-full sm:w-auto sm:absolute sm:bottom-4 sm:right-4 px-3 py-2 shadow-sm hover:bg-[#cc5f00] hover:text-black`}
                      disabled={item.title !== "Google Drive"}
                    >
                      {item.title !== "Google Drive" ? "Coming Soon" : item.isConnected ? "Add Files" : "Connect"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTableId} onOpenChange={(open) => !open && setDeleteTableId(null)}>
          <DialogContent className="sm:max-w-md bg-[#191919] border-[#2a2a2a]">
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete this file? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteTableId(null)}
                className="hover:bg-[#2a2a2a]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

