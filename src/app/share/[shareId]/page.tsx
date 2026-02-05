
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { ChatMessageDisplay, Message } from "@/components/chat/ChatMessageDisplay"
import { Button } from "@/components/ui/button"
import { MessageSquare, Copy } from "lucide-react"

export default function SharedSession() {
    const { shareId } = useParams()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [tables, setTables] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sessionTitle, setSessionTitle] = useState("Shared Analytics Session")

    useEffect(() => {
        const loadSharedSession = async () => {
            try {
                const session = await api.getSharedSession(shareId as string)
                setMessages(session.messages || [])
                setSessionTitle(session.title || "Shared Analytics Session")
            } catch (e: any) {
                console.error("Failed to load shared session:", e)
                setError(e.message || "Failed to load session")
            } finally {
                setLoading(false)
            }
        }
        loadSharedSession()
    }, [shareId])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#171616] text-slate-300">
                Loading shared analysis...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#171616] flex-col gap-4">
                <div className="text-red-400">Unable to load session</div>
                <div className="text-slate-500 text-sm">{error}</div>
                <Button onClick={() => router.push('/')} variant="outline">Go Home</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-[#171616] text-slate-100 overflow-y-auto">
            {/* Header */}
            <div className="border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 bg-[#171616]/80 backdrop-blur z-10">
                <div>
                    <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">Shared View</div>
                    <h1 className="font-serif text-xl text-slate-200">{sessionTitle}</h1>
                </div>
                <Button
                    onClick={() => router.push('/')}
                    className="bg-[#E67820] hover:bg-[#E67820]/90 text-white"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start New Chat
                </Button>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto py-8 px-6 w-full flex-1">
                {messages.map((msg, index) => (
                    <ChatMessageDisplay
                        key={msg.id}
                        message={msg}
                        tables={tables} // Shared view might not have full table meta unless public, but basic display works
                        isLast={index === messages.length - 1}
                    />
                ))}

                <div className="mt-12 p-8 bg-[#1f1e1e] rounded-2xl text-center">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Want to analyze your own data?</h3>
                    <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                        Limelight allows you to connect your databases and ask questions in plain English.
                    </p>
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-white text-black hover:bg-slate-200 text-base py-6 px-8 rounded-full"
                    >
                        Get Started for Free
                    </Button>
                </div>
            </div>
        </div>
    )
}
