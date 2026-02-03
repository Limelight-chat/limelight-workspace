'use client'

import { useEffect, useState } from 'react'
import InputBox from "@/components/InputBox"
import { IconInfoCircle } from "@tabler/icons-react"
import { Search, ChartColumn, File } from "lucide-react"
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { api } from '@/lib/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

import { VerificationRequest } from "@/components/chat/VerificationRequest"

interface QueryResult {
  sql: string
  rows: Array<Record<string, any>>
  total_rows: number
  truncated: boolean
  summary: string | null
  execution_time: number
  pipeline_trace?: {
    intent?: string
    status?: string
    session_id?: string
    analytical_plan?: any
    formula?: string
    plan?: any
  }
}

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Chat() {
  const router = useRouter()
  const { profile } = useAuthContext()
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'search' | 'source' | 'charts'>('search')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [sourceData, setSourceData] = useState<Record<string, any> | null>(null)
  const [sourceLoading, setSourceLoading] = useState(false)
  const [errorSourceTables, setErrorSourceTables] = useState<string[]>([])

  // Get user name from auth context
  const userName = profile?.name?.split(' ')[0] || 'User'

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      const data = await api.getTables()
      setTables(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleQuerySubmit = async (query: string) => {
    setUserQuery(query)
    setHasSubmitted(true)
    setActiveTab('search')
    setQueryLoading(true)
    setQueryError(null)
    setSourceData(null) // Reset source data for new query
    setQueryResult(null) // Reset previous result

    try {
      // Get all table IDs to query
      const tableIds = tables.map(t => t.id)
      const result = await api.executeQuery(query, tableIds)
      setQueryResult(result)
    } catch (error: unknown) {
      console.error('Query failed:', error)

      // Handle structured error with selected tables
      const err = error as { message?: string; detail?: { selected_table_ids?: string[]; message?: string }; selected_table_ids?: string[] }
      let errorMessage = err.message || 'Failed to execute query'

      try {
        // Direct property check (since we throw the full object now)
        if (err.detail && typeof err.detail === 'object') {
          if (err.detail.selected_table_ids) {
            setErrorSourceTables(err.detail.selected_table_ids)
            // Auto-switch to source tab on error if we have tables to show
            setActiveTab('source')
          }
          if (err.detail.message) {
            errorMessage = err.detail.message
          }
        }
        else if (err.selected_table_ids) {
          setErrorSourceTables(err.selected_table_ids)
          setActiveTab('source')
        }

      } catch (e) {
        console.warn('Failed to parse error details', e)
      }

      setQueryError(errorMessage)
    } finally {
      setQueryLoading(false)
    }
  }

  const handleVerificationSuccess = (newResult: QueryResult) => {
    console.log("Verification successful, updating result:", newResult)
    setQueryResult(newResult)
  }

  // Extract tables used from SQL query
  const getUsedTables = () => {
    // If we have a successful result, show tables used in the SQL
    if (queryResult?.sql) {
      const usedTables = tables.filter(table => {
        const tableNamePattern = new RegExp(`\\b${table.table_name}\\b`, 'i')
        return tableNamePattern.test(queryResult.sql)
      })
      return usedTables
    }

    // If we have an error and captured source tables, show those
    if (queryError && errorSourceTables.length > 0) {
      return tables.filter(table => errorSourceTables.includes(table.id))
    }

    return []
  }

  // Fetch complete source data for used tables
  const fetchSourceData = async () => {
    const usedTables = getUsedTables()
    if (usedTables.length === 0) return

    setSourceLoading(true)
    try {
      const sourceDataPromises = usedTables.map(async (table) => {
        // Query all data from the table (Unlimited & Excluded from History)
        const result = await api.executeQuery(`SELECT * FROM ${table.table_name}`, [table.id], true, true)
        return {
          tableId: table.id,
          tableName: table.table_name,
          originalFilename: table.original_filename,
          data: result
        }
      })

      const allSourceData = await Promise.all(sourceDataPromises)
      const sourceDataMap = allSourceData.reduce((acc, item) => {
        acc[item.tableId] = item
        return acc
      }, {} as Record<string, any>)

      setSourceData(sourceDataMap)
    } catch (error) {
      console.error('Failed to fetch source data:', error)
    } finally {
      setSourceLoading(false)
    }
  }

  // Fetch source data when switching to source tab or when we have an error with source files
  useEffect(() => {
    // Current condition: Active tab is source, AND we have either a result OR an error with captured table IDs.
    // AND we haven't loaded source data yet.
    if (activeTab === 'source' && (queryResult || (queryError && errorSourceTables.length > 0)) && !sourceData) {
      fetchSourceData()
    }
  }, [activeTab, queryResult, queryError, errorSourceTables])

  // Helper to create columns from data keys
  const createColumns = (data: any[]): ColumnDef<any>[] => {
    if (data.length === 0) return []
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ row }) => {
        const value = row.getValue(key)
        return value !== null && value !== undefined ? String(value) : '-'
      }
    }))
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-[#171616] text-slate-100">


        {/* content area */}
        <div className="flex-1 overflow-y-auto">
          {!hasSubmitted ? (
            // Landing State: Centered
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="w-full max-w-2xl text-center space-y-8">

                <div className="flex justify-center mb-6">
                  <div className="bg-[#1f1e1e] border border-[#2e2d2d] rounded-full px-3 py-1.5 flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-300">Free plan</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif text-[#d8d3cf]">
                  Hello, {userName}
                </h1>

                <div className="w-full">
                  <InputBox onSubmit={handleQuerySubmit} />
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {/* Optional suggestions pills could go here if needed later */}
                </div>

              </div>
            </div>
          ) : (
            // Results State: Top-aligned content
            <div className="max-w-5xl mx-auto px-6 pt-24 pb-32">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight mb-4">
                {userQuery}
              </h1>

              <div className="flex items-center mt-4">
                <div className="inline-flex bg-[#1f1e1e] p-1 rounded-lg border border-[#2e2d2d]">
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'search'
                      ? 'bg-[#2f2f2f] text-[#f5f5f0] shadow-sm'
                      : 'text-[#a3a3a3] hover:text-[#f5f5f0]'
                      }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('source')}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'source'
                      ? 'bg-[#2f2f2f] text-[#f5f5f0] shadow-sm'
                      : 'text-[#a3a3a3] hover:text-[#f5f5f0]'
                      }`}
                  >
                    <IconInfoCircle className="w-4 h-4" />
                    <span>Source</span>
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md text-[#a3a3a3]/50 cursor-not-allowed"
                  >
                    <ChartColumn className="w-4 h-4" />
                    <span>Charts</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 w-full border-b border-grey-800"></div>

              {/* Search Tab Content */}
              {activeTab === 'search' && (
                <>
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Files Used</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {queryLoading ? (
                        <div className="text-slate-400">Loading...</div>
                      ) : (() => {
                        const usedTables = getUsedTables()
                        return usedTables.length === 0 ? (
                          <div className="text-slate-400">No tables used in this query</div>
                        ) : (
                          usedTables.map((table) => (
                            <div key={table.id} className="flex items-center gap-2 bg-[#232222] rounded-xl px-3 py-3 w-full sm:w-56">
                              <div className="w-10 h-10 bg-orange-500 rounded-md shrink-0 flex items-center justify-center">
                                <File className="w-5 h-5 text-black/80" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs uppercase text-slate-300 font-semibold">
                                  {table.original_filename}
                                </div>
                                <div className="mt-1 text-sm text-slate-400">{table.row_count} rows</div>
                              </div>
                            </div>
                          ))
                        )
                      })()}
                    </div>

                    {/* Source Explanation Note for Errors */}
                    {queryError && errorSourceTables.length > 0 && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-[#f5f5f0]/70 bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                        <IconInfoCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                        <p>
                          The system selected these {getUsedTables().length} files accurately based on your query before encountering an error.
                          This confirms the reasoning engine understood your intent but failed during execution.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Output</h3>

                    {/* VERIFICATION UI */}
                    {(queryResult?.pipeline_trace?.status === 'VERIFICATION_REQUIRED' ||
                      queryResult?.pipeline_trace?.status === 'MISSING_RELATIONSHIP') && (
                        <VerificationRequest
                          pipelineTrace={queryResult.pipeline_trace}
                          onSuccess={handleVerificationSuccess}
                        />
                      )}

                    {queryLoading ? (
                      <div className="bg-[#131313] rounded-2xl p-8 text-center">
                        <div className="text-slate-400">Executing query...</div>
                      </div>
                    ) : queryError ? (
                      <div className="bg-[#131313] rounded-2xl p-8 text-center">
                        <div className="text-red-400">{queryError}</div>
                      </div>
                    ) : queryResult && queryResult.rows.length > 0 ? (
                      <>
                        {queryResult.summary && (
                          <p className="text-slate-300 mb-4">{queryResult.summary}</p>
                        )}
                        <div className="bg-[#131313] rounded-2xl overflow-hidden">
                          <DataTable
                            columns={createColumns(queryResult.rows)}
                            data={queryResult.rows}
                          />
                        </div>
                        <div className="mt-3 text-sm text-slate-400">
                          {queryResult.total_rows} row{queryResult.total_rows !== 1 ? 's' : ''} returned
                          {queryResult.truncated && ' (truncated)'}
                          {' • '}
                          Executed in {queryResult.execution_time.toFixed(2)}s
                        </div>
                      </>
                    ) : queryResult && queryResult.pipeline_trace?.status !== 'VERIFICATION_REQUIRED' && queryResult.pipeline_trace?.status !== 'MISSING_RELATIONSHIP' ? (
                      <div className="bg-[#131313] rounded-2xl p-8 text-center">
                        <div className="text-slate-400">No results found</div>
                      </div>
                    ) : (
                      !queryResult && (
                        <div className="bg-[#131313] rounded-2xl p-8 text-center">
                          <div className="text-slate-400">Submit a query to see results</div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}

              {/* Source Tab Content */}
              {activeTab === 'source' && (
                <div className="mt-6">
                  {/* Alert for Error State */}
                  {queryError && errorSourceTables.length > 0 && (
                    <div className="mb-6">
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Execution Failed</AlertTitle>
                        <AlertDescription>
                          The query failed to run, but we&apos;ve loaded the full content of the files the system selected.
                          This allows you to inspect the data that was considered.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {(queryResult || (queryError && errorSourceTables.length > 0)) && (
                    <>
                      {sourceLoading ? (
                        <div className="bg-[#131313] rounded-2xl p-8 text-center">
                          <div className="text-slate-400">Loading source data...</div>
                        </div>
                      ) : sourceData ? (
                        <div className="space-y-8">
                          {Object.values(sourceData).map((tableData: any) => (
                            <div key={tableData.tableId}>
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase">
                                  Source File: {tableData.originalFilename}
                                </h3>
                                <span className="text-xs text-slate-500">
                                  ({tableData.data.total_rows} rows)
                                </span>
                              </div>
                              {tableData.data.rows.length > 0 ? (
                                <div className="bg-[#131313] rounded-2xl overflow-hidden">
                                  <DataTable
                                    columns={createColumns(tableData.data.rows)}
                                    data={tableData.data.rows}
                                  />
                                </div>
                              ) : (
                                <div className="bg-[#131313] rounded-2xl p-8 text-center">
                                  <div className="text-slate-400">No data in this table</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-[#131313] rounded-2xl p-8 text-center">
                          <div className="text-slate-400">No source data available</div>
                        </div>
                      )}
                    </>
                  )}
                  {(!queryResult && (!queryError || errorSourceTables.length === 0)) && (
                    <div className="bg-[#131313] rounded-2xl p-8 text-center">
                      <div className="text-slate-400">Submit a query to see source data</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Box - only fixed at bottom when content has been submitted */}
        {hasSubmitted && (
          <div className="sticky bottom-0 w-full px-4 sm:px-6 py-4 bg-linear-to-t from-[#171616] via-[#171616] to-transparent">
            <div className="max-w-5xl mx-auto">
              <InputBox onSubmit={handleQuerySubmit} />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
