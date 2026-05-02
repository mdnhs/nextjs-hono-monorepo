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
import { IconPackage, IconShoppingCart, IconUsers, IconChartBar, IconSettings, IconLayoutDashboard, IconBuildingStore, IconCreditCard } from "@tabler/icons-react"

const teams = [
  {
    name: "Store Admin",
    logo: <IconBuildingStore />,
    plan: "Seller",
  },
]

const navItems = [
  {
    title: "Dashboard",
    url: "/store-admin",
    icon: <IconLayoutDashboard />,
    isActive: true,
    items: [
      { title: "Overview", url: "/store-admin" },
      { title: "Analytics", url: "/store-admin/analytics" },
    ],
  },
  {
    title: "Products",
    url: "/store-admin/products",
    icon: <IconPackage />,
    items: [
      { title: "All Products", url: "/store-admin/products" },
      { title: "Add New", url: "/store-admin/products/create" },
      { title: "Categories", url: "/store-admin/products/categories" },
      { title: "Inventory", url: "/store-admin/products/inventory" },
    ],
  },
  {
    title: "Orders",
    url: "/store-admin/orders",
    icon: <IconShoppingCart />,
    items: [
      { title: "All Orders", url: "/store-admin/orders" },
      { title: "Pending", url: "/store-admin/orders?status=pending" },
      { title: "Processing", url: "/store-admin/orders?status=processing" },
      { title: "Shipped", url: "/store-admin/orders?status=shipped" },
      { title: "Delivered", url: "/store-admin/orders?status=delivered" },
    ],
  },
  {
    title: "Customers",
    url: "/store-admin/customers",
    icon: <IconUsers />,
    items: [
      { title: "All Customers", url: "/store-admin/customers" },
      { title: "Segments", url: "/store-admin/customers/segments" },
    ],
  },
  {
    title: "Subscription",
    url: "/store-admin/subscription",
    icon: <IconCreditCard />,
    items: [
      { title: "Current Plan", url: "/store-admin/subscription" },
      { title: "Upgrade", url: "/store-admin/subscription/upgrade" },
      { title: "Billing History", url: "/store-admin/subscription/billing" },
    ],
  },
  {
    title: "Settings",
    url: "/store-admin/settings",
    icon: <IconSettings />,
    items: [
      { title: "Store Info", url: "/store-admin/settings" },
      { title: "Payment", url: "/store-admin/settings/payment" },
      { title: "Shipping", url: "/store-admin/settings/shipping" },
      { title: "Domain", url: "/store-admin/settings/domain" },
    ],
  },
]

const projects = [
  {
    name: "Quick Orders",
    url: "/store-admin/orders?sort=recent",
    icon: <IconShoppingCart />,
  },
  {
    name: "Low Stock",
    url: "/store-admin/products/inventory?filter=low_stock",
    icon: <IconPackage />,
  },
]

const user = {
  name: "Store Owner",
  email: "store@example.com",
  avatar: "",
}

export function StoreAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
