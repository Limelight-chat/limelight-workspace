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
import { FileText, Trash2, Loader2, RefreshCw, FileSpreadsheet, FileIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GooglePicker } from "@/components/google-picker";
import { useSearchParams } from "next/navigation";

interface Table {
  id: string;
  table_name: string;
  original_filename: string;
  uploaded_at: string;
  row_count?: number;
}

interface GoogleSyncedFile {
  id: string;
  google_file_id: string;
  filename: string;
  mime_type: string;
  file_type: string;
  sync_enabled: boolean;
  last_synced_at?: string;
  sync_status?: string;
  sync_error?: string;
  table_id?: string;
  table_name?: string;
  row_count?: number;
  document_id?: string;
  document_name?: string;
  chunk_count?: number;
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
  const searchParams = useSearchParams();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email?: string } | null>(null);
  const [syncedFiles, setSyncedFiles] = useState<GoogleSyncedFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

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

  const fetchGoogleStatus = async () => {
    try {
      const status = await api.getGoogleStatus();
      setGoogleStatus(status);
      if (status.connected) {
        fetchSyncedFiles();
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Google status:", err);
    }
  };

  const fetchSyncedFiles = async () => {
    try {
      const files = await api.getGoogleSyncedFiles();
      setSyncedFiles(files);
    } catch (err: unknown) {
      console.error("Failed to fetch synced files:", err);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const { authorization_url } = await api.getGoogleAuthUrl();
      window.location.href = authorization_url;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to connect Google");
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Drive?")) {
      return;
    }

    try {
      await api.disconnectGoogle();
      setGoogleStatus({ connected: false });
      setSyncedFiles([]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to disconnect Google");
    }
  };

  const handleFilesPicked = async (files: Array<{ file_id: string; mime_type: string; name: string }>) => {
    setImporting(true);
    setShowPicker(false);

    try {
      const result = await api.importGoogleFiles(files);

      if (result.success.length > 0) {
        alert(`Successfully imported ${result.success.length} file(s)`);
        fetchSyncedFiles();
        fetchTables();
      }

      if (result.failed.length > 0) {
        alert(`Failed to import ${result.failed.length} file(s)`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to import files");
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveSyncedFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to remove this file?")) {
      return;
    }

    try {
      await api.removeGoogleSyncedFile(fileId);
      setSyncedFiles(syncedFiles.filter(f => f.id !== fileId));
      fetchTables();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove file");
    }
  };

  const handleSyncFile = async (fileId: string) => {
    try {
      await api.triggerGoogleSync(fileId);
      alert("Sync triggered successfully");
      fetchSyncedFiles();
      fetchTables();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to sync file");
    }
  };

  useEffect(() => {
    fetchTables();
    fetchGoogleStatus();

    // Check for Google OAuth redirect
    const googleParam = searchParams.get('google');
    if (googleParam === 'connected') {
      fetchGoogleStatus();
      // Remove the query parameter from URL
      window.history.replaceState({}, '', '/connections');
    }

    // Listen for file upload events
    const handleFileUploaded = () => {
      fetchTables();
    };

    window.addEventListener('fileUploaded', handleFileUploaded);

    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, [searchParams]);

  const handleDelete = async (tableId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await api.deleteTable(tableId);
      setTables(tables.filter(t => t.id !== tableId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete file");
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
                        onClick={() => handleDelete(table.id)}
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

          {/* Google Drive Files Section */}
          {googleStatus?.connected && syncedFiles.length > 0 && (
            <div className="sm:max-h-none overflow-x-auto sm:overflow-visible pr-2 bg-[#191919] border border-[#2a2a2a] rounded-xl p-6">
              <h1 className="text-primary font-medium text-xl mb-4">Google Drive Files</h1>
              <div className="grid gap-3">
                {syncedFiles.map((file) => (
                  <Card key={file.id} className="p-3 bg-[#232323] border-[#2f2e2e]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-content-center rounded border border-[#2f2e2e] bg-[#363535]">
                          {file.file_type === 'sheet' ? (
                            <FileSpreadsheet className="size-4" />
                          ) : (
                            <FileIcon className="size-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{file.filename}</h3>
                          <p className="text-xs text-muted-foreground">
                            {file.row_count ? `${file.row_count} rows` : file.chunk_count ? `${file.chunk_count} chunks` : ""}
                            {file.last_synced_at && ` • ${new Date(file.last_synced_at).toLocaleDateString()}`}
                            {file.sync_status === 'error' && (
                              <span className="text-red-500"> • Sync error</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.file_type === 'sheet' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSyncFile(file.id)}
                            aria-label="Sync file"
                            className="hover:bg-[#363535]"
                          >
                            <RefreshCw className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSyncedFile(file.id)}
                          aria-label="Remove file"
                          className="hover:bg-[#363535]"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

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

                    {item.title === "Google Drive" && googleStatus?.connected && (
                      <div className="text-xs text-green-500 mt-2">
                        Connected as {googleStatus.email}
                      </div>
                    )}

                    {item.title === "Google Drive" ? (
                      googleStatus?.connected ? (
                        <div className="flex gap-2 ml-auto mt-4 w-full sm:w-auto sm:absolute sm:bottom-4 sm:right-4">
                          {showPicker ? (
                            <GooglePicker
                              onFilesPicked={handleFilesPicked}
                              onCancel={() => setShowPicker(false)}
                            />
                          ) : (
                            <>
                              <Button
                                className="bg-[#FF7D0B] text-black rounded-md px-3 py-2 shadow-sm hover:bg-[#cc5f00] hover:text-black"
                                onClick={() => setShowPicker(true)}
                                disabled={importing}
                              >
                                {importing ? "Importing..." : "Choose Files"}
                              </Button>
                              <Button
                                variant="ghost"
                                className="px-3 py-2"
                                onClick={handleGoogleDisconnect}
                              >
                                Disconnect
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="bg-[#FF7D0B] text-black rounded-md ml-auto mt-4 w-full sm:w-auto sm:absolute sm:bottom-4 sm:right-4 px-3 py-2 shadow-sm hover:bg-[#cc5f00] hover:text-black"
                          onClick={handleGoogleConnect}
                        >
                          Connect
                        </Button>
                      )
                    ) : (
                      <Button
                        className="bg-[#FF7D0B] text-black rounded-md ml-auto mt-4 w-full sm:w-auto sm:absolute sm:bottom-4 sm:right-4 px-3 py-2 shadow-sm hover:bg-[#cc5f00] hover:text-black"
                        disabled
                      >
                        Coming Soon
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

