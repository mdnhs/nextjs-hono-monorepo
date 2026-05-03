"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { IconLayoutDashboard, IconUser, IconPackage, IconShield, IconBuildingStore, IconCreditCard, IconPlus } from "@tabler/icons-react"

const teams = [
  {
    name: "Seller Central",
    logo: <IconBuildingStore />,
    plan: "Seller",
  },
]

const navItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: <IconLayoutDashboard />,
    isActive: true,
    items: [
      { title: "Summary", url: "/dashboard" },
      { title: "Stores", url: "/dashboard" },
      { title: "Activity", url: "/dashboard/activity" },
    ],
  },
  {
    title: "Store Management",
    url: "/dashboard/stores",
    icon: <IconPackage />,
    items: [
      { title: "All Stores", url: "/dashboard" },
      { title: "Create Store", url: "/dashboard/stores/new" },
    ],
  },
  {
    title: "Billing & Plans",
    url: "/dashboard/billing",
    icon: <IconCreditCard />,
    items: [
      { title: "Subscription", url: "/dashboard/billing" },
      { title: "Invoices", url: "/dashboard/billing/invoices" },
    ],
  },
  {
    title: "Account",
    url: "/account",
    icon: <IconUser />,
    items: [
      { title: "Profile", url: "/account/profile" },
      { title: "Security", url: "/account/settings/security" },
      { title: "Settings", url: "/account/settings" },
    ],
  },
]

const projects = [
  {
    name: "Create Store",
    url: "/dashboard/stores/new",
    icon: <IconPlus />,
  },
  {
    name: "SaaS Support",
    url: "/support",
    icon: <IconShield />,
  },
]

const user = {
  name: "Seller Account",
  email: "seller@example.com",
  avatar: "",
}

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
