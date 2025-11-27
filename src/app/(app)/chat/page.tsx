'use client'

import { useEffect, useState } from 'react'
import InputBox from "@/components/InputBox"
import { IconInfoCircle } from "@tabler/icons-react"
import { Search, ChartColumn, File } from "lucide-react"
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface QueryResult {
  sql: string
  rows: Array<Record<string, any>>
  total_rows: number
  truncated: boolean
  summary: string | null
  execution_time: number
}

export default function Chat() {
  const router = useRouter()
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const handleQuerySubmit = async (query: string) => {
    setUserQuery(query)
    setHasSubmitted(true)
    setActiveTab('search')
    setQueryLoading(true)
    setQueryError(null)
    setSourceData(null) // Reset source data for new query
    
    try {
      // Get all table IDs to query
      const tableIds = tables.map(t => t.id)
      const result = await api.executeQuery(query, tableIds)
      setQueryResult(result)
    } catch (error: any) {
      console.error('Query failed:', error)
      setQueryError(error.message || 'Failed to execute query')
    } finally {
      setQueryLoading(false)
    }
  }

  // Extract tables used from SQL query
  const getUsedTables = () => {
    if (!queryResult?.sql) return []
    
    const usedTables = tables.filter(table => {
      // Check if table name appears in the SQL query
      const tableNamePattern = new RegExp(`\\b${table.table_name}\\b`, 'i')
      return tableNamePattern.test(queryResult.sql)
    })
    
    return usedTables
  }

  // Fetch complete source data for used tables
  const fetchSourceData = async () => {
    const usedTables = getUsedTables()
    if (usedTables.length === 0) return

    setSourceLoading(true)
    try {
      const sourceDataPromises = usedTables.map(async (table) => {
        // Query all data from the table
        const result = await api.executeQuery(`SELECT * FROM ${table.table_name}`, [table.id])
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

  // Fetch source data when switching to source tab
  useEffect(() => {
    if (activeTab === 'source' && queryResult && !sourceData) {
      fetchSourceData()
    }
  }, [activeTab, queryResult])

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-[#171616] text-slate-100">
        {/* Header with Sign Out */}
        <div className="px-6 py-3 border-b border-gray-800 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            {tables.length} table(s) uploaded
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-400 hover:text-white"
          >
            Sign Out
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-12 pb-32">
            
            {hasSubmitted && (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
                  {userQuery}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <button 
                    onClick={() => setActiveTab('search')}
                    className={`flex items-center gap-2 text-sm text-slate-300 px-2 py-1 rounded-md hover:brightness-110 ${
                      activeTab === 'search' ? 'bg-black' : 'bg-transparent'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('source')}
                    className={`flex items-center gap-2 text-sm text-slate-300 px-2 py-1 rounded-md hover:brightness-110 ${
                      activeTab === 'source' ? 'bg-black' : 'bg-transparent'
                    }`}
                  >
                    <IconInfoCircle className="w-4 h-4" />
                    <span>Source</span>
                  </button>
                  <button 
                    disabled
                    className="flex items-center gap-2 text-sm text-slate-500 bg-transparent px-2 py-1 rounded-md cursor-not-allowed opacity-50"
                  >
                    <ChartColumn className="w-4 h-4" />
                    <span>Charts</span>
                  </button>
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
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Output</h3>
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
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="border-b border-gray-800">
                                  <tr>
                                    {Object.keys(queryResult.rows[0]).map((column) => (
                                      <th key={column} className="text-left px-4 py-3 text-slate-400 font-medium">
                                        {column}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {queryResult.rows.map((row, idx) => (
                                    <tr key={idx} className={idx < queryResult.rows.length - 1 ? "border-b border-gray-800/50" : ""}>
                                      {Object.values(row).map((value, colIdx) => (
                                        <td key={colIdx} className="px-4 py-3 text-slate-300">
                                          {value !== null && value !== undefined ? String(value) : '-'}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-slate-400">
                            {queryResult.total_rows} row{queryResult.total_rows !== 1 ? 's' : ''} returned
                            {queryResult.truncated && ' (truncated)'}
                            {' • '}
                            Executed in {queryResult.execution_time.toFixed(2)}s
                          </div>
                        </>
                      ) : queryResult ? (
                        <div className="bg-[#131313] rounded-2xl p-8 text-center">
                          <div className="text-slate-400">No results found</div>
                        </div>
                      ) : (
                        <div className="bg-[#131313] rounded-2xl p-8 text-center">
                          <div className="text-slate-400">Submit a query to see results</div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Source Tab Content */}
                {activeTab === 'source' && (
                  <div className="mt-6">
                    {queryResult && (
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
                                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                      <table className="w-full text-sm">
                                        <thead className="border-b border-gray-800 sticky top-0 bg-[#131313]">
                                          <tr>
                                            {Object.keys(tableData.data.rows[0]).map((column) => (
                                              <th key={column} className="text-left px-4 py-3 text-slate-400 font-medium">
                                                {column}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {tableData.data.rows.map((row: any, idx: number) => (
                                            <tr key={idx} className={idx < tableData.data.rows.length - 1 ? "border-b border-gray-800/50" : ""}>
                                              {Object.values(row).map((value: any, colIdx: number) => (
                                                <td key={colIdx} className="px-4 py-3 text-slate-300">
                                                  {value !== null && value !== undefined ? String(value) : '-'}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
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
                    {!queryResult && (
                      <div className="bg-[#131313] rounded-2xl p-8 text-center">
                        <div className="text-slate-400">Submit a query to see source data</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fixed Input Box */}
        <div className="sticky bottom-0 w-full px-4 sm:px-6 py-4 bg-linear-to-t from-[#171616] via-[#171616] to-transparent">
          <div className="max-w-5xl mx-auto">
            <InputBox onSubmit={handleQuerySubmit} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
