"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronRight,
  Key,
  Link,
  BarChart3,
  Tag,
  Clock,
  Network,
  CheckCircle,
  AlertTriangle,
  Info,
  Database
} from "lucide-react";

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
  target_original_filename?: string;
  source_column: string;
  target_column: string;
  relationship_type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  confidence_score: number;
  sample_matches: number;
  tier?: 'tier_1_explicit' | 'tier_2_dimensional' | 'tier_3_semantic';
  status?: 'active' | 'passive' | 'rejected';
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

interface EnhancedFileMetadataProps {
  metadata: EnhancedTableMetadata;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'primary_key':
      return <Key className="w-4 h-4 text-yellow-500" />;
    case 'foreign_key':
      return <Link className="w-4 h-4 text-blue-500" />;
    case 'measure':
      return <BarChart3 className="w-4 h-4 text-green-500" />;
    case 'dimension':
      return <Tag className="w-4 h-4 text-purple-500" />;
    case 'time':
      return <Clock className="w-4 h-4 text-orange-500" />;
    default:
      return <Database className="w-4 h-4 text-gray-500" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'primary_key':
      return 'Primary Key';
    case 'foreign_key':
      return 'Foreign Key';
    case 'measure':
      return 'Measure';
    case 'dimension':
      return 'Dimension';
    case 'time':
      return 'Time';
    default:
      return 'Unknown';
  }
};

const getRelationshipTypeLabel = (type: string) => {
  switch (type) {
    case 'one_to_one':
      return '1:1';
    case 'one_to_many':
      return '1:many';
    case 'many_to_one':
      return 'many:1';
    case 'many_to_many':
      return 'many:many';
    default:
      return type;
  }
};

// User-friendly tier labels
const getTierInfo = (tier?: string) => {
  switch (tier) {
    case 'tier_1_explicit':
      return { label: 'Verified', color: 'bg-green-100 text-green-800', description: 'Primary key match' };
    case 'tier_2_dimensional':
      return { label: 'Inferred', color: 'bg-blue-100 text-blue-800', description: 'Column name match' };
    case 'tier_3_semantic':
      return { label: 'AI Suggested', color: 'bg-purple-100 text-purple-800', description: 'Semantic similarity' };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', description: '' };
  }
};

// User-friendly status badges  
const getStatusInfo = (status?: string) => {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'bg-green-500 text-white', icon: '✓' };
    case 'passive':
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '○' };
    case 'rejected':
      return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '✕' };
    default:
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '○' };
  }
};

// Extract semantic name from original filename (remove extension)
const getSemanticName = (originalFilename?: string, tableName?: string) => {
  if (originalFilename) {
    return originalFilename.replace(/\.(csv|xlsx|xls)$/i, '').replace(/_/g, ' ');
  }
  // Fallback: strip timestamp suffix from table name
  if (tableName) {
    return tableName.replace(/_\d{13,}$/, '').replace(/^data_/, '').replace(/_/g, ' ');
  }
  return 'Unknown';
};

export default function EnhancedFileMetadata({ metadata }: EnhancedFileMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // Group columns by role
  const columnsByRole = metadata.columns.reduce((acc, col) => {
    if (!acc[col.role]) acc[col.role] = [];
    acc[col.role].push(col);
    return acc;
  }, {} as Record<string, ColumnMetadata[]>);

  return (
    <Card className="w-full">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">{metadata.original_filename}</span>
                </div>

                {/* Quick status indicators */}
                <div className="flex items-center space-x-2">
                  {metadata.graph_readiness.is_ready ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Network className="w-3 h-3 mr-1" />
                      Graph Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Limited
                    </Badge>
                  )}

                  <Badge variant="outline">
                    {metadata.row_count.toLocaleString()} rows
                  </Badge>

                  <Badge variant="outline">
                    {metadata.relationships.length} connections
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {formatDate(metadata.uploaded_at)}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">

              {/* Column Classifications */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Column Classifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(columnsByRole).map(([role, columns]) => (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role)}
                        <span className="font-medium text-sm">{getRoleLabel(role)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {columns.length}
                        </Badge>
                      </div>
                      <div className="ml-6 space-y-1">
                        {columns.map((col) => (
                          <div key={col.name} className="flex items-center justify-between text-sm">
                            <span className="font-mono">{col.name}</span>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{formatPercentage(col.completeness)} complete</span>
                              {col.role === 'primary_key' && (
                                <span>{formatPercentage(col.uniqueness)} unique</span>
                              )}
                              {col.distinct_count > 0 && (
                                <span>{col.distinct_count} distinct</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationships */}
              {metadata.relationships.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Network className="w-4 h-4 mr-2" />
                    Relationships ({metadata.relationships.length})
                  </h4>
                  <div className="space-y-3">
                    {metadata.relationships.map((rel, index) => {
                      const tierInfo = getTierInfo(rel.tier);
                      const statusInfo = getStatusInfo(rel.status);
                      const semanticTarget = getSemanticName(rel.target_original_filename, rel.target_table_name);

                      return (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg border border-muted">
                          {/* Main relationship display - semantic names */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Link className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-base capitalize">
                                  {rel.source_column} → {semanticTarget}
                                </div>
                                {/* Original table name in muted text */}
                                <div className="text-xs text-muted-foreground font-mono">
                                  {rel.target_table_name}.{rel.target_column}
                                </div>
                              </div>
                            </div>

                            {/* Confidence score */}
                            <div className="text-right flex-shrink-0 ml-4">
                              <div className="text-lg font-semibold">
                                {formatPercentage(rel.confidence_score)}
                              </div>
                              <div className="text-xs text-muted-foreground">confidence</div>
                            </div>
                          </div>

                          {/* Badges row: Tier + Status + Relationship type */}
                          <div className="flex items-center gap-2 mt-3">
                            {/* Tier badge */}
                            <Badge className={`${tierInfo.color} text-xs`} variant="secondary">
                              {tierInfo.label}
                            </Badge>

                            {/* Status badge */}
                            <Badge className={`${statusInfo.color} text-xs`} variant="secondary">
                              {statusInfo.icon} {statusInfo.label}
                            </Badge>

                            {/* Relationship type */}
                            <Badge variant="outline" className="text-xs">
                              {getRelationshipTypeLabel(rel.relationship_type)}
                            </Badge>

                            {/* Tier description tooltip-like text */}
                            {tierInfo.description && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {tierInfo.description}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Graph Readiness */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Network className="w-4 h-4 mr-2" />
                  Graph Analysis Readiness
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Quality Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={metadata.graph_readiness.quality_score * 100}
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium">
                        {formatPercentage(metadata.graph_readiness.quality_score)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      {metadata.graph_readiness.has_primary_key ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm">Primary Key</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {metadata.graph_readiness.has_relationships ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm">Relationships</span>
                    </div>
                  </div>

                  {metadata.graph_readiness.issues.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2 flex items-center">
                        <Info className="w-4 h-4 mr-1" />
                        Issues to Address:
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {metadata.graph_readiness.issues.map((issue, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metadata.columns.length}</div>
                  <div className="text-xs text-muted-foreground">Columns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metadata.row_count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Rows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metadata.relationships.length}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(metadata.graph_readiness.quality_score)}
                  </div>
                  <div className="text-xs text-muted-foreground">Quality</div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}