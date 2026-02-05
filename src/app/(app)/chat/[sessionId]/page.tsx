
import ChatInterface from "@/components/chat/ChatInterface"
import { api } from "@/lib/api"
import { redirect } from "next/navigation"

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params

    // Optional: We could validate session here or prefetch
    // For now, let client component handle loading state

    return <ChatInterface sessionId={sessionId} />
}
