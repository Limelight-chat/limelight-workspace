
import { useState, useEffect } from "react"
import { Search, ChartColumn, File, AlertCircle } from "lucide-react"
import { IconInfoCircle } from "@tabler/icons-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { VerificationRequest } from "@/components/chat/VerificationRequest"
import { api } from "@/lib/api"
// Removed missing import


// We need to match the backend ChatMessage schema but adapted for frontend use
// Since we don't have shared types yet, I'll define a local interface that matches the backend response
export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    generated_sql?: string
    result_data?: any[]
    row_count?: number
    execution_time_ms?: number
    status?: string // success, error
    error_message?: string
    created_at?: string
    // For frontend extended state (e.g. from pipeline trace)
    pipeline_trace?: any
    summary?: string
}

interface ChatMessageDisplayProps {
    message: Message
    tables: any[]
    isLast: boolean
}

export function ChatMessageDisplay({ message, tables, isLast }: ChatMessageDisplayProps) {
    const [activeTab, setActiveTab] = useState<'search' | 'source' | 'charts'>('search')
    const [sourceData, setSourceData] = useState<Record<string, any> | null>(null)
    const [sourceLoading, setSourceLoading] = useState(false)
    const [errorSourceTables, setErrorSourceTables] = useState<string[]>([])

    // Parse error details if status is error
    useEffect(() => {
        if (message.status === 'error' && message.error_message) {
            try {
                // Try to parse if it's a JSON string (sometimes error messages are)
                // Or if the error structure passed from backend contains details
                // Note: In the refactor, we might simply receive 'error_message' as string. 
                // If we want detailed error info (source tables), we might need to adjust the backend to store it 
                // or parse it from the text if encoded.
                // For now, let's assume if it came from our execution flow, we might have stored it.
                // But persistent messages only have text fields. 
                // TODO: Backend 'chat_messages' table might need to store structured error info in 'result_data' for errors too.
            } catch (e) {
                // ignore
            }
        }
    }, [message])

    // Helper to create columns from data keys
    const createColumns = (data: any[]): ColumnDef<any>[] => {
        if (!data || data.length === 0) return []
        return Object.keys(data[0]).map((key) => ({
            accessorKey: key,
            header: key,
            cell: ({ row }) => {
                const value = row.getValue(key)
                return value !== null && value !== undefined ? String(value) : '-'
            }
        }))
    }

    // Extract tables used from SQL query
    const getUsedTables = () => {
        if (message.generated_sql) {
            const usedTables = tables.filter(table => {
                const tableNamePattern = new RegExp(`\\b${table.table_name}\\b`, 'i')
                return tableNamePattern.test(message.generated_sql || '')
            })
            return usedTables
        }
        // TODO: Handle error source tables from persisted state if possible
        return []
    }

    // Fetch source data logic
    const fetchSourceData = async () => {
        const usedTables = getUsedTables()
        if (usedTables.length === 0) return

        setSourceLoading(true)
        try {
            const sourceDataPromises = usedTables.map(async (table) => {
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

    // Fetch on tab switch
    useEffect(() => {
        if (activeTab === 'source' && !sourceData) {
            fetchSourceData()
        }
    }, [activeTab])

    // If role is user, just show the query text (styled as a header)
    if (message.role === 'user') {
        return (
            <div className="pt-8 pb-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight mb-4 text-slate-100">
                    {message.content}
                </h1>
                <div className="mt-4 w-full border-b border-gray-800"></div>
            </div>
        )
    }

    // Assistant Message UI
    return (
        <div className="pb-12">
            {/* Tabs */}
            <div className="flex items-center mb-6">
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

            {/* Search Content */}
            {activeTab === 'search' && (
                <>
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Files Used</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {getUsedTables().length === 0 ? (
                                <div className="text-slate-400">No specific tables used or query failed.</div>
                            ) : (
                                getUsedTables().map((table) => (
                                    <div key={table.id} className="flex items-center gap-2 bg-[#232222] rounded-xl px-3 py-3 w-full sm:w-56">
                                        <div className="w-10 h-10 bg-orange-500 rounded-md shrink-0 flex items-center justify-center">
                                            <File className="w-5 h-5 text-black/80" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs uppercase text-slate-300 font-semibold truncate">
                                                {table.original_filename}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-400">{table.row_count} rows</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Content Output */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Output</h3>

                        {/* Show error if failed */}
                        {message.status === 'error' ? (
                            <div className="bg-[#131313] rounded-2xl p-8 text-center">
                                <div className="text-red-400">{message.error_message || "An error occurred during execution."}</div>
                                {message.content && <p className="mt-4 text-slate-400 text-sm">{message.content}</p>}
                            </div>
                        ) : (
                            <>
                                {/* Text Content / Summary */}
                                {/* Note: In chat_messages, 'content' holds the summary/text response. 'result_data' holds rows. */}
                                {message.content && (
                                    <p className="text-slate-300 mb-4 whitespace-pre-wrap">{message.content}</p>
                                )}

                                {/* Table Data */}
                                {message.result_data && message.result_data.length > 0 && (
                                    <div className="bg-[#131313] rounded-2xl overflow-hidden mb-2">
                                        <DataTable
                                            columns={createColumns(message.result_data)}
                                            data={message.result_data}
                                        />
                                    </div>
                                )}

                                {/* Stats Footer */}
                                <div className="mt-3 text-sm text-slate-400">
                                    {message.row_count || 0} row{(message.row_count !== 1) ? 's' : ''} returned
                                    {(message.result_data?.length || 0) < (message.row_count || 0) && ' (truncated)'}
                                    {' • '}
                                    Executed in {((message.execution_time_ms || 0) / 1000).toFixed(2)}s
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Source Tab */}
            {activeTab === 'source' && (
                <div className="mt-6">
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
                            <div className="text-slate-400">No source data available for the referenced tables.</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
