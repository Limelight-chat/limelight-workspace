"use client";

import * as React from "react";
import {
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Bookmark,
  Link,
  CirclePlus,
  MessagesSquare,
  Database,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { useSidebar } from "@/components/ui/sidebar"
import { TeamSwitcher } from "@/components/team-switcher";
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Arnav",
    email: "a@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Limelight Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Chat",
      url: "/chat",
      icon: CirclePlus,
    },
    {
      title: "History",
      url: "/history",
      icon: MessagesSquare,
    },
    {
      title: "Library",
      url: "/library",
      icon: Bookmark,
    },
    {
      title: "Memory",
      url: "/memory",
      icon: Database,
    },
    {
      title: "Connections",
      url: "/connections",
      icon: Link,
    },
  ],
  projects: [
    {
      name: "Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Design",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "HR",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          
          {!isCollapsed && (
            <TeamSwitcher teams={data.teams} />
          )}
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
