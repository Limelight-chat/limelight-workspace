"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Loader2 } from "lucide-react";

interface Table {
  id: string;
  table_name: string;
  original_filename: string;
  uploaded_at: string;
  row_count?: number;
}

export default function LibraryPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTables();
      setTables(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load files");
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

  const handleDelete = async (tableId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await api.deleteTable(tableId);
      setTables(tables.filter(t => t.id !== tableId));
    } catch (err: any) {
      alert(err.message || "Failed to delete file");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchTables}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Your Files</h1>
        <p className="text-muted-foreground">
          Manage your uploaded data files
        </p>
      </div>

      {tables.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No files yet</h2>
          <p className="text-muted-foreground">
            Upload your first file to get started
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-content-center rounded border bg-muted">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">{table.original_filename}</h3>
                    <p className="text-sm text-muted-foreground">
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
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
