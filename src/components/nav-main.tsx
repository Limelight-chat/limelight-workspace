"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={item.isActive}
              className={
                "transition-all rounded-md hover:bg-sidebar-accent " +
                // consistent base padding so selecting doesn't shift layout
                "px-3 py-2 " +
                // active state: dark background and slightly bolder text
                (item.isActive ? "bg-[#141414] text-sidebar-foreground font-medium" : "")
              }
            >
              <Link href={item.url} className="flex items-center gap-3">
                {item.icon && (
                  <item.icon className="text-[#ff8e2b] size-4 shrink-0" />
                )}
                <span className={item.isActive ? "font-medium" : ""}>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}