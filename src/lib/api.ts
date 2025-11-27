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

  // Get table schema
  async getTableSchema(tableId: string) {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/api/tables/${tableId}`, {
      headers,
    })

    if (!response.ok) {
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
}
