
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import InputBox from "@/components/InputBox"
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { api } from '@/lib/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { ChatMessageDisplay, Message } from "@/components/chat/ChatMessageDisplay"
import { Share, Copy, Check, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ChatInterfaceProps {
    sessionId?: string
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
    const router = useRouter()
    const { profile } = useAuthContext()
    const [tables, setTables] = useState<any[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [shareUrl, setShareUrl] = useState('')
    const [copied, setCopied] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Get user name from auth context
    const userName = profile?.name?.split(' ')[0] || 'User'

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Load tables and session
    useEffect(() => {
        const init = async () => {
            // Only show full loading if we have no messages (fresh load)
            // If we have messages, it means we just created the session client-side
            if (messages.length === 0) setLoading(true)

            try {
                // Load tables for context if not loaded
                if (tables.length === 0) {
                    const tablesData = await api.getTables()
                    setTables(Array.isArray(tablesData) ? tablesData : [])
                }

                // If session ID exists and we have no messages, load them
                if (currentSessionId && messages.length === 0) {
                    try {
                        const session = await api.getSession(currentSessionId)
                        setMessages(session.messages || [])
                        setShareUrl(`${window.location.origin}/share/${session.share_id || ''}`)
                    } catch (e) {
                        console.error("Failed to load session:", e)
                    }
                }
            } catch (error) {
                console.error('Failed to initialize chat:', error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [currentSessionId]) // Keep dependency, but logic inside handles the "don't clear" case

    const handleQuerySubmit = async (query: string) => {
        if (!query.trim()) return

        // Optimistically add user message
        const tempUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, tempUserMsg])
        setSending(true)

        try {
            let activeSessionId = currentSessionId

            if (!activeSessionId) {
                const newSession = await api.createSession(query.substring(0, 50)) // Auto-title
                activeSessionId = newSession.id
                // Do NOT set currentSessionId yet if it triggers a re-fetch that clears messages
                // Instead, silent update URL and let local state persist
                // We only set it to sync valid ID for sharing
                setCurrentSessionId(newSession.id)

                // Update URL without causing navigation/refresh
                window.history.pushState({}, '', `/chat/${newSession.id}`)
            }

            // Execute query with session ID
            // Get all table IDs to query
            const tableIds = tables.map(t => t.id)

            const result = await api.executeQuery(query, tableIds, false, false, activeSessionId!)

            // Add assistant message
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(), // Backend usually triggers this creation, but we get result directly
                role: 'assistant',
                content: result.summary || "Query executed successfully.",
                generated_sql: result.sql,
                result_data: result.rows,
                row_count: result.total_rows,
                execution_time_ms: result.execution_time * 1000,
                status: 'success',
                created_at: new Date().toISOString(),
                pipeline_trace: result.pipeline_trace
            }

            setMessages(prev => [...prev, assistantMsg])

        } catch (error: any) {
            console.error('Query failed:', error)

            // Add error message
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: error.detail?.message || "An error occurred.",
                status: 'error',
                error_message: error.message || "Failed to execute query",
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setSending(false)
        }
    }

    const handleShare = async () => {
        if (!currentSessionId) return

        try {
            // Create public link or just get existing
            // Always update to ensure is_public=true if it wasn't
            const updated = await api.updateSession(currentSessionId, { is_public: true })

            if (updated.share_id) {
                const url = `${window.location.origin}/share/${updated.share_id}`;
                setShareUrl(url)
                setShareDialogOpen(true)
            } else {
                console.warn("No share ID returned from updated session", updated);
            }
        } catch (e) {
            console.error("Failed to share session:", e)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-[#171616] text-slate-100">

                {/* Header (only show if session active or messages exist) */}
                {(messages.length > 0 || currentSessionId) && (
                    <div className="border-b border-white/5 px-6 py-3 flex justify-between items-center sticky top-0 bg-[#171616]/80 backdrop-blur z-10">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-300">
                                {messages.length > 0 && messages[0].content ?
                                    (messages[0].content.length > 30 ? messages[0].content.substring(0, 30) + '...' : messages[0].content)
                                    : 'New Chat'}
                            </span>
                        </div>
                        <div>
                            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-400 hover:text-slate-200 hover:bg-[#2f2f2f] transition-colors"
                                        onClick={handleShare}
                                    >
                                        <Share className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#242424] border-0 text-slate-100 shadow-2xl max-w-md rounded-xl p-6">
                                    <DialogHeader className="mb-4">
                                        <DialogTitle className="font-serif text-2xl font-normal text-[#f5f5f5]">
                                            Share this chat
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-400 text-base">
                                            Create a public link to share this conversation with others.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        {/* Link Input Area */}
                                        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-lg border border-white/5 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                                            <div className="flex-1 px-3">
                                                {shareUrl ? (
                                                    <input
                                                        readOnly
                                                        value={shareUrl}
                                                        className="bg-transparent border-0 w-full text-sm text-slate-300 focus:outline-none placeholder:text-slate-600 font-mono"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <div className="w-3 h-3 border-2 border-slate-500/30 border-t-slate-500 rounded-full animate-spin" />
                                                        Generating link...
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={copyToClipboard}
                                                disabled={!shareUrl}
                                                className={`h-8 px-4 font-medium transition-all ${copied
                                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                                    : "bg-[#333] hover:bg-[#404040] text-slate-200"
                                                    }`}
                                            >
                                                {copied ? "Copied" : "Copy Link"}
                                            </Button>
                                        </div>

                                        {/* Footer / Disclaimer */}
                                        <div className="bg-[#2a2a2a] rounded-lg p-3 flex gap-3 items-start">
                                            <div className="mt-0.5 text-slate-400">
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Messages sent after sharing will not automatically update the public link.
                                                Share again to update the view.
                                            </p>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                )}

                {/* content area */}
                <div className="flex-1 overflow-y-auto px-4">
                    {messages.length === 0 ? (
                        // Landing State
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="w-full max-w-2xl text-center space-y-8">
                                <div className="flex justify-center mb-6">
                                    <div className="bg-[#1f1e1e] border border-[#2e2d2d] rounded-full px-3 py-1.5 flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-300">Free plan</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-serif text-[#d8d3cf]">
                                    Hello, {userName}
                                </h1>

                                {/* Initial Input here if empty */}
                                <div className="w-full">
                                    <InputBox onSubmit={handleQuerySubmit} disabled={sending} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Conversation History
                        <div className="max-w-5xl mx-auto py-8">
                            {messages.map((msg, index) => (
                                <ChatMessageDisplay
                                    key={msg.id}
                                    message={msg}
                                    tables={tables}
                                    isLast={index === messages.length - 1}
                                />
                            ))}

                            {/* Loader for pending response */}
                            {sending && (
                                <div className="py-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Box - Sticky at bottom for conversation */}
                {messages.length > 0 && (
                    <div className="w-full px-4 sm:px-6 py-4 bg-linear-to-t from-[#171616] via-[#171616] to-transparent sticky bottom-0 z-10">
                        <div className="max-w-5xl mx-auto">
                            <InputBox onSubmit={handleQuerySubmit} disabled={sending} />
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
