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
import { IconLayoutDashboard, IconShoppingBag, IconHeart, IconUser, IconSettings, IconStar, IconPackage, IconShield } from "@tabler/icons-react"

const teams = [
  {
    name: "My Dashboard",
    logo: <IconStar />,
    plan: "Buyer",
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
      { title: "Recent Activity", url: "/dashboard/activity" },
    ],
  },
  {
    title: "My Orders",
    url: "/dashboard/orders",
    icon: <IconShoppingBag />,
    items: [
      { title: "All Orders", url: "/dashboard/orders" },
      { title: "Pending", url: "/dashboard/orders?status=pending" },
      { title: "Shipped", url: "/dashboard/orders?status=shipped" },
      { title: "Delivered", url: "/dashboard/orders?status=delivered" },
    ],
  },
  {
    title: "Wishlist",
    url: "/dashboard/wishlist",
    icon: <IconHeart />,
    items: [
      { title: "Saved Items", url: "/dashboard/wishlist" },
    ],
  },
  {
    title: "Account",
    url: "/account",
    icon: <IconUser />,
    items: [
      { title: "Profile", url: "/account/profile" },
      { title: "Addresses", url: "/account/addresses" },
      { title: "Payment Methods", url: "/account/payment-methods" },
    ],
  },
  {
    title: "Settings",
    url: "/account/settings",
    icon: <IconSettings />,
    items: [
      { title: "Preferences", url: "/account/settings" },
      { title: "Security", url: "/account/settings/security" },
    ],
  },
]

const projects = [
  {
    name: "Recent Orders",
    url: "/dashboard/orders?sort=recent",
    icon: <IconPackage />,
  },
  {
    name: "Wishlist",
    url: "/dashboard/wishlist",
    icon: <IconHeart />,
  },
]

const user = {
  name: "Buyer",
  email: "buyer@example.com",
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
