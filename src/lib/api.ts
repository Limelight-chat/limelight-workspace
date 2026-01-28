import { supabase } from './supabase'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
  }
}

export const api = {
  // Upload file
  async uploadFile(file: File) {
    const headers = await getAuthHeaders()
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Upload failed')
    }

    return response.json()
  },

  // Get job status
  async getJobStatus(jobId: string) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get job status')
    }

    return response.json()
  },

  // Get all tables
  async getTables() {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/tables`, {
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get tables')
    }

    return response.json()
  },

  // Get enhanced tables with metadata (Aggregated Client-Side)
  async getEnhancedTables() {
    try {
      // 1. Fetch tables list
      const tables = await this.getTables();

      // 2. Fetch relationships for all tables
      let relationships: any[] = [];
      try {
        const relData = await this.getRelationships();
        relationships = relData.relationships || [];
      } catch (e) {
        console.warn('Failed to fetch relationships:', e);
      }

      // 3. Fetch full schemas for each table (to get columns)
      const enhancedTables = await Promise.all(tables.map(async (table: any) => {
        let columns: any[] = [];
        let processingStatus = "ready";

        try {
          const schema = await this.getTableSchema(table.id);
          columns = schema.columns.map((col: any) => ({
            name: col.name,
            type: col.type,
            role: 'unknown', // Basic backend doesn't return role in basic schema usually, might need adjustment if it does
            nullable: col.nullable,
            completeness: 1.0, // Mocked as we don't have this in basic schema
            uniqueness: 0,
            distinct_count: 0,
            sample_values: [],
          }));
        } catch (e) {
          console.warn(`Failed to fetch schema for table ${table.id}`, e);
          processingStatus = "error";
        }

        // Filter relationships for this table
        const tableRelationships = relationships.filter((r: any) =>
          r.from_table_id === table.id || r.to_table_id === table.id
        ).map((r: any) => ({
          target_table_id: r.from_table_id === table.id ? r.to_table_id : r.from_table_id,
          target_table_name: r.from_table_id === table.id ? r.to_table : r.from_table,
          source_column: r.from_table_id === table.id ? r.from_column : r.to_column,
          target_column: r.from_table_id === table.id ? r.to_column : r.from_column,
          relationship_type: 'one_to_many', // Default/Inferred
          confidence_score: r.confidence_score,
          sample_matches: 0
        }));

        // Determine readiness
        const hasPrimaryKey = columns.some((c: any) => c.role === 'primary_key'); // Unlikely to be true without profiling data mapping
        const hasRelationships = tableRelationships.length > 0;
        const isReady = hasRelationships; // Simplified readiness check

        return {
          id: table.id,
          table_name: table.table_name,
          original_filename: table.original_filename,
          uploaded_at: table.uploaded_at,
          row_count: table.row_count,
          columns: columns,
          relationships: tableRelationships,
          graph_readiness: {
            is_ready: isReady,
            has_primary_key: hasPrimaryKey,
            has_relationships: hasRelationships,
            relationship_count: tableRelationships.length,
            quality_score: hasRelationships ? 0.8 : 0.4,
            issues: !hasRelationships ? ['No relationships detected'] : []
          },
          processing_status: processingStatus
        };
      }));

      return enhancedTables;

    } catch (error) {
      console.error("Error aggregating enhanced tables:", error);
      throw error;
    }
  },

  // Get relationships (Direct usage of new endpoint if available, or helper)
  async getRelationships(status?: string) {
    const headers = await getAuthHeaders();
    const url = new URL(`${API_URL}/api/relationships`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get relationships');
    }
    return response.json();
  },

  // Get enhanced metadata for specific table (Aggregated)
  async getEnhancedTableMetadata(tableId: string) {
    const tables = await this.getEnhancedTables();
    return tables.find((t: any) => t.id === tableId);
  },

  // Get table relationships
  async getTableRelationships(tableId: string) {
    const allRels = await this.getRelationships();
    return {
      relationships: allRels.relationships.filter((r: any) =>
        r.from_table_id === tableId || r.to_table_id === tableId
      )
    };
  },

  // Get graph readiness
  async getTableGraphReadiness(tableId: string) {
    const table = await this.getEnhancedTableMetadata(tableId);
    if (!table) throw new Error("Table not found");
    return table.graph_readiness;
  },

  // Get table schema
  async getTableSchema(tableId: string) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/tables/${tableId}`, {
      headers,
    })

    if (!response.ok) {
      // Handle 404 gracefully if needed, or throw
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get table schema')
    }

    return response.json()
  },

  // Delete table
  async deleteTable(tableId: string) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/tables/${tableId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete table')
    }

    return response.json()
  },

  // Execute query
  async executeQuery(query: string, tableIds?: string[]) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/query`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        table_ids: tableIds,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Query failed')
    }

    return response.json()
  },

  // =============================================================================
  // PDF Document Methods
  // =============================================================================

  // Upload PDF file
  async uploadPdf(file: File) {
    const headers = await getAuthHeaders()
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/api/upload/pdf`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'PDF upload failed')
    }

    return response.json()
  },

  // Query PDF documents with RAG
  async queryPdf(query: string, documentIds?: string[], topK?: number, useReranking?: boolean) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/query/pdf`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        document_ids: documentIds,
        top_k: topK,
        use_reranking: useReranking,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'PDF query failed')
    }

    return response.json()
  },

  // List PDF documents
  async listPdfDocuments() {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/documents/pdf`, {
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to list PDF documents')
    }

    return response.json()
  },

  // Delete PDF document
  async deletePdfDocument(documentId: string) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/documents/pdf/${documentId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete PDF document')
    }

    return response.json()
  },

  // =============================================================================
  // Relationship Management Methods
  // =============================================================================

  // Confirm a detected relationship
  async confirmRelationship(candidateId: string) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/relationships/${candidateId}/confirm`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to confirm relationship')
    }

    return response.json()
  },

  // Reject a detected relationship
  async rejectRelationship(candidateId: string) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/relationships/${candidateId}/reject`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to reject relationship')
    }

    return response.json()
  },
}
