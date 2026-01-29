'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { api } from '@/lib/api'
import { Search, Trash2, X, Loader2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'

interface HistoryItem {
    id: string
    query_text: string
    generated_sql: string | null
    result_summary: string | null
    row_count: number | null
    execution_time_ms: number | null
    status: string
    error_message: string | null
    table_ids: string[] | null
    created_at: string
}

interface QueryResult {
    query_text: string
    sql: string
    rows: Array<Record<string, any>>
    total_rows: number
    truncated: boolean
    execution_time: number
}

export default function HistoryPage() {
    const router = useRouter()
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Result modal state
    const [resultModal, setResultModal] = useState<{
        visible: boolean
        loading: boolean
        error: string | null
        result: QueryResult | null
        queryText: string
    }>({
        visible: false,
        loading: false,
        error: null,
        result: null,
        queryText: ''
    })

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        try {
            setLoading(true)
            const data = await api.getQueryHistory()
            setHistory(data.items || [])
        } catch (err: unknown) {
            console.error('Failed to load history:', err)
            setError(err instanceof Error ? err.message : 'Failed to load history')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (deleting) return

        try {
            setDeleting(id)
            await api.deleteQueryHistoryItem(id)
            setHistory(prev => prev.filter(item => item.id !== id))
            selectedIds.delete(id)
            setSelectedIds(new Set(selectedIds))
        } catch (err: unknown) {
            console.error('Failed to delete:', err)
        } finally {
            setDeleting(null)
        }
    }

    const handleItemClick = async (item: HistoryItem) => {
        if (selectMode) {
            const newSelected = new Set(selectedIds)
            if (newSelected.has(item.id)) {
                newSelected.delete(item.id)
            } else {
                newSelected.add(item.id)
            }
            setSelectedIds(newSelected)
            return
        }

        // Open modal and run stored SQL
        setResultModal({
            visible: true,
            loading: true,
            error: null,
            result: null,
            queryText: item.query_text
        })

        try {
            const result = await api.rerunHistoryItem(item.id)
            setResultModal(prev => ({
                ...prev,
                loading: false,
                result: result
            }))
        } catch (err: unknown) {
            setResultModal(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'Failed to run query'
            }))
        }
    }

    const closeModal = () => {
        setResultModal({
            visible: false,
            loading: false,
            error: null,
            result: null,
            queryText: ''
        })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        const diffMonths = Math.floor(diffDays / 30)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    }

    // Filter history based on search
    const filteredHistory = history.filter(item =>
        item.query_text.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDeleteSelected = async () => {
        for (const id of selectedIds) {
            try {
                await api.deleteQueryHistoryItem(id)
            } catch (err) {
                console.error('Failed to delete:', err)
            }
        }
        setHistory(prev => prev.filter(item => !selectedIds.has(item.id)))
        setSelectedIds(new Set())
        setSelectMode(false)
    }

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-[#171616] text-slate-100">
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-6 py-8">
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search your queries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#232222] border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gray-500 transition-colors"
                            />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-400">
                                {filteredHistory.length} queries
                            </span>
                            {history.length > 0 && (
                                <button
                                    onClick={() => {
                                        setSelectMode(!selectMode)
                                        setSelectedIds(new Set())
                                    }}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                    {selectMode ? 'Cancel' : 'Select'}
                                </button>
                            )}
                        </div>

                        {/* Delete Selected Button */}
                        {selectMode && selectedIds.size > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="mb-4 flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete {selectedIds.size} selected
                            </button>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-slate-400">Loading...</div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-red-400 mb-3">{error}</div>
                                <button
                                    onClick={loadHistory}
                                    className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="text-center py-16">
                                {searchQuery ? (
                                    <p className="text-slate-500">No queries match your search</p>
                                ) : (
                                    <>
                                        <p className="text-slate-400 mb-2">No queries yet</p>
                                        <p className="text-slate-500 text-sm mb-6">
                                            Start asking questions in the chat to see your history here
                                        </p>
                                        <button
                                            onClick={() => router.push('/chat')}
                                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Go to Chat
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800/50">
                                {filteredHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className="group py-4 cursor-pointer hover:bg-[#1e1d1d] -mx-3 px-3 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox in select mode */}
                                            {selectMode && (
                                                <div className="pt-0.5">
                                                    <div
                                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.has(item.id)
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'border-gray-600'
                                                            }`}
                                                    >
                                                        {selectedIds.has(item.id) && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                {/* Query text */}
                                                <p className="text-slate-100 font-medium leading-snug line-clamp-2">
                                                    {item.query_text}
                                                </p>

                                                {/* Timestamp */}
                                                <p className="text-sm text-slate-500 mt-1.5">
                                                    Last message {formatDate(item.created_at)}
                                                </p>
                                            </div>

                                            {/* Delete button (visible on hover, not in select mode) */}
                                            {!selectMode && (
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    disabled={deleting === item.id}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Modal */}
                {resultModal.visible && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1e1d1d] rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between p-5 border-b border-gray-800">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h2 className="text-lg font-semibold text-slate-100 line-clamp-2">
                                        {resultModal.queryText}
                                    </h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-5">
                                {resultModal.loading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                                        <span className="ml-3 text-slate-400">Running query...</span>
                                    </div>
                                ) : resultModal.error ? (
                                    <div className="text-center py-16">
                                        <div className="text-red-400">{resultModal.error}</div>
                                    </div>
                                ) : resultModal.result ? (
                                    <>
                                        {/* Result Stats */}
                                        <div className="mb-4 text-sm text-slate-400">
                                            {resultModal.result.total_rows} row{resultModal.result.total_rows !== 1 ? 's' : ''}
                                            {resultModal.result.truncated && ' (showing first 100)'}
                                            {' • '}
                                            {resultModal.result.execution_time.toFixed(2)}s
                                        </div>

                                        {/* Result Table */}
                                        {resultModal.result.rows.length > 0 ? (
                                            <div className="bg-[#131313] rounded-xl overflow-hidden">
                                                <DataTable
                                                    columns={Object.keys(resultModal.result.rows[0]).map((key) => ({
                                                        accessorKey: key,
                                                        header: key,
                                                        cell: ({ row }) => {
                                                            const value = row.getValue(key)
                                                            return value !== null && value !== undefined ? String(value) : '-'
                                                        }
                                                    })) as ColumnDef<any>[]}
                                                    data={resultModal.result.rows}
                                                    maxHeight="max-h-[500px]"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-500">
                                                No results
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
