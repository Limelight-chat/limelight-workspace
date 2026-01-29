"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Database, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import EnhancedFileMetadata from "./enhanced-file-metadata";

// Type definitions matching backend schemas
interface ColumnMetadata {
  name: string;
  type: string;
  role: 'primary_key' | 'foreign_key' | 'measure' | 'dimension' | 'time' | 'unknown';
  nullable: boolean;
  completeness: number;
  uniqueness: number;
  distinct_count: number;
  sample_values: string[];
  min_value?: string;
  max_value?: string;
}

interface RelationshipInfo {
  target_table_id: string;
  target_table_name: string;
  source_column: string;
  target_column: string;
  relationship_type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  confidence_score: number;
  sample_matches: number;
}

interface GraphReadiness {
  is_ready: boolean;
  has_primary_key: boolean;
  has_relationships: boolean;
  relationship_count: number;
  quality_score: number;
  issues: string[];
}

interface EnhancedTableMetadata {
  id: string;
  table_name: string;
  original_filename: string;
  uploaded_at: string;
  row_count: number;
  columns: ColumnMetadata[];
  relationships: RelationshipInfo[];
  graph_readiness: GraphReadiness;
  processing_status: string;
  last_profiled?: string;
}

export default function EnhancedFileList() {
  const [tables, setTables] = useState<EnhancedTableMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTables = async () => {
    try {
      setError(null);
      const data = await api.getEnhancedTables();
      setTables(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tables';
      console.error('Failed to load enhanced tables:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTables();
  };

  useEffect(() => {
    loadTables();

    // Listen for file upload events to refresh the list
    const handleFileUploaded = () => {
      setTimeout(() => {
        loadTables();
      }, 2000); // Wait a bit for processing to complete
    };

    window.addEventListener('fileUploaded', handleFileUploaded);
    return () => window.removeEventListener('fileUploaded', handleFileUploaded);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Your Data Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Your Data Library
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const graphReadyTables = tables.filter(t => t.graph_readiness.is_ready);
  const totalRelationships = tables.reduce((sum, t) => sum + t.relationships.length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Your Data Library
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{tables.length}</div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{graphReadyTables.length}</div>
              <div className="text-sm text-muted-foreground">Graph Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalRelationships}</div>
              <div className="text-sm text-muted-foreground">Relationships</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {tables.length > 0 ? Math.round((graphReadyTables.length / tables.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Ready Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <div className="space-y-4">
        {tables.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
              <p className="text-muted-foreground">
                Upload CSV or Excel files to see detailed metadata and relationship analysis.
              </p>
            </CardContent>
          </Card>
        ) : (
          tables.map((table) => (
            <EnhancedFileMetadata key={table.id} metadata={table} />
          ))
        )}
      </div>
    </div>
  );
}