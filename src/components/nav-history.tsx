
"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Trash2, Share, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { api } from "@/lib/api"

export function NavHistory() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger]) // Add dependency to refresh when needed

  const loadSessions = async () => {
    try {
      const data = await api.listSessions(10, 0) // Get last 10 sessions
      setSessions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        await api.deleteSession(id)
        setSessions(prev => prev.filter(s => s.id !== id))
      } catch (error) {
        console.error("Failed to delete session:", error)
      }
    }
  }

  // Reload history when path changes to /chat (new chat might have been created)
  useEffect(() => {
    if (pathname === '/chat' || pathname.startsWith('/chat/')) {
        // Simple debounce/check could be added here
        loadSessions()
    }
  }, [pathname])

  if (loading && sessions.length === 0) {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <div className="px-2 py-2 text-xs text-muted-foreground">Loading...</div>
        </SidebarGroup>
    )
  }

  if (sessions.length === 0) {
     return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
      <SidebarMenu>
        {sessions.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild isActive={pathname === `/chat/${item.id}`}>
              <Link href={`/chat/${item.id}`} title={item.title}>
                <span>{item.title || "Untitled Chat"}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={(e) => handleDelete(item.id, e as any)}>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Chat</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {/* View All Link */}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70" asChild>
            <Link href="/history">
              <MoreHorizontal className="text-sidebar-foreground/70" />
              <span>View all history</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
