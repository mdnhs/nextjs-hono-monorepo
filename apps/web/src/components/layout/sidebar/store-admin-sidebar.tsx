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
import { IconPackage, IconShoppingCart, IconUsers, IconChartBar, IconSettings, IconLayoutDashboard, IconBuildingStore, IconCreditCard, IconWorld } from "@tabler/icons-react"
import { useParams } from "next/navigation"

const teams = [
  {
    name: "Store Admin",
    logo: <IconBuildingStore />,
    plan: "Seller",
  },
]

export function StoreAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams()
  const storeId = params.storeId as string
  
  const baseUrl = storeId ? `/store-admin/${storeId}` : "/store-admin"

  const navItems = [
    {
      title: "Dashboard",
      url: baseUrl,
      icon: <IconLayoutDashboard />,
      isActive: true,
      items: [
        { title: "Overview", url: baseUrl },
        { title: "Analytics", url: `${baseUrl}/analytics` },
      ],
    },
    {
      title: "Online Store",
      url: `${baseUrl}/cms`,
      icon: <IconWorld />,
      items: [
        { title: "Theme", url: `${baseUrl}/cms/theme` },
        { title: "Pages", url: `${baseUrl}/cms/pages` },
        { title: "Navigation", url: `${baseUrl}/cms/navigation` },
      ],
    },
    {
      title: "Products",
      url: `${baseUrl}/products`,
      icon: <IconPackage />,
      items: [
        { title: "All Products", url: `${baseUrl}/products` },
        { title: "Add New", url: `${baseUrl}/products/create` },
        { title: "Categories", url: `${baseUrl}/products/categories` },
        { title: "Inventory", url: `${baseUrl}/products/inventory` },
      ],
    },
    {
      title: "Orders",
      url: `${baseUrl}/orders`,
      icon: <IconShoppingCart />,
      items: [
        { title: "All Orders", url: `${baseUrl}/orders` },
        { title: "Pending", url: `${baseUrl}/orders?status=pending` },
        { title: "Processing", url: `${baseUrl}/orders?status=processing` },
        { title: "Shipped", url: `${baseUrl}/orders?status=shipped` },
        { title: "Delivered", url: `${baseUrl}/orders?status=delivered` },
      ],
    },
    {
      title: "Customers",
      url: `${baseUrl}/customers`,
      icon: <IconUsers />,
      items: [
        { title: "All Customers", url: `${baseUrl}/customers` },
        { title: "Segments", url: `${baseUrl}/customers/segments` },
      ],
    },
    {
      title: "Subscription",
      url: `${baseUrl}/subscription`,
      icon: <IconCreditCard />,
      items: [
        { title: "Current Plan", url: `${baseUrl}/subscription` },
        { title: "Upgrade", url: `${baseUrl}/subscription/upgrade` },
        { title: "Billing History", url: `${baseUrl}/subscription/billing` },
      ],
    },
    {
      title: "Settings",
      url: `${baseUrl}/settings`,
      icon: <IconSettings />,
      items: [
        { title: "Store Info", url: `${baseUrl}/settings` },
        { title: "Payment", url: `${baseUrl}/settings/payment` },
        { title: "Shipping", url: `${baseUrl}/settings/shipping` },
        { title: "Domain", url: `${baseUrl}/settings/domain` },
      ],
    },
  ]

  const projects = [
    {
      name: "Quick Orders",
      url: `${baseUrl}/orders?sort=recent`,
      icon: <IconShoppingCart />,
    },
    {
      name: "Low Stock",
      url: `${baseUrl}/products/inventory?filter=low_stock`,
      icon: <IconPackage />,
    },
  ]

  const user = {
    name: "Store Owner",
    email: "store@example.com",
    avatar: "",
  }

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
