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
import { IconUsers, IconBuildingStore, IconCreditCard, IconReceipt, IconSettings, IconLayoutDashboard, IconShield, IconStar, IconShoppingCart } from "@tabler/icons-react"

const teams = [
  {
    name: "Platform Admin",
    logo: <IconShield />,
    plan: "Enterprise",
  },
]

const navItems = [
  {
    title: "Overview",
    url: "/admin",
    icon: <IconLayoutDashboard />,
    isActive: true,
    items: [
      { title: "Dashboard", url: "/admin" },
      { title: "Analytics", url: "/admin/analytics" },
    ],
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: <IconUsers />,
    items: [
      { title: "All Users", url: "/admin/users" },
      { title: "Roles & Permissions", url: "/admin/users/roles" },
      { title: "Buyers", url: "/admin/users?role=buyer" },
      { title: "Sellers", url: "/admin/users?role=seller" },
    ],
  },
  {
    title: "Stores",
    url: "/admin/stores",
    icon: <IconBuildingStore />,
    items: [
      { title: "All Stores", url: "/admin/stores" },
      { title: "Pending Approval", url: "/admin/stores?status=pending" },
      { title: "Approved", url: "/admin/stores?status=approved" },
      { title: "Suspended", url: "/admin/stores?status=suspended" },
    ],
  },
  {
    title: "Plans",
    url: "/admin/plans",
    icon: <IconStar />,
    items: [
      { title: "All Plans", url: "/admin/plans" },
      { title: "Create Plan", url: "/admin/plans/create" },
      { title: "Features", url: "/admin/plans/features" },
    ],
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: <IconShoppingCart />,
    items: [
      { title: "All Orders", url: "/admin/orders" },
      { title: "Pending", url: "/admin/orders?status=pending" },
      { title: "Delivered", url: "/admin/orders?status=delivered" },
      { title: "Cancelled", url: "/admin/orders?status=cancelled" },
    ],
  },
  {
    title: "Billing",
    url: "/admin/billing",
    icon: <IconReceipt />,
    items: [
      { title: "Subscriptions", url: "/admin/billing/subscriptions" },
      { title: "Invoices", url: "/admin/billing/invoices" },
      { title: "Transactions", url: "/admin/billing/transactions" },
    ],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: <IconSettings />,
    items: [
      { title: "General", url: "/admin/settings" },
      { title: "Email", url: "/admin/settings/email" },
      { title: "Integrations", url: "/admin/settings/integrations" },
    ],
  },
]

const projects = [
  {
    name: "Recent Signups",
    url: "/admin/users?sort=recent",
    icon: <IconUsers />,
  },
  {
    name: "Pending Stores",
    url: "/admin/stores?status=pending",
    icon: <IconBuildingStore />,
  },
]

const user = {
  name: "Platform Admin",
  email: "admin@example.com",
  avatar: "",
}

export function PlatformAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
