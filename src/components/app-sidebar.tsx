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
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavHistory } from "@/components/nav-history";
import { useSidebar } from "@/components/ui/sidebar"
import { TeamSwitcher } from "@/components/team-switcher";
import { NavUser } from "@/components/nav-user"
import { useAuthContext } from "@/contexts/AuthContext";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";

const staticData = {
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
    const { profile } = useAuthContext()

    const user = {
        name: profile?.name || "User",
        email: profile?.email || "",
        avatar: profile?.avatar || "",
    }

    const teams = [
        {
            name: profile?.companyName || "My Company",
            logo: GalleryVerticalEnd,
            plan: "Free",
        },
    ]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2">

                    {!isCollapsed && (
                        <TeamSwitcher teams={teams} />
                    )}
                    <SidebarTrigger className="cursor-pointer" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={staticData.navMain} />
                <NavHistory />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
