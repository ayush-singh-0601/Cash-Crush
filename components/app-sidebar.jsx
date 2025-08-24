"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  User, 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  PiggyBank,
  Calendar,
  Plus,
  Tag,
  CreditCard
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const pathname = usePathname();
  
  // Auto-detect active section based on current path
  const activeSection = pathname.startsWith("/personal") ? "personal-finance" : "expense-sharing";
  const [selectedSection, setSelectedSection] = useState(activeSection);

  // Don't show on auth pages
  if (pathname.startsWith("/sign-") || pathname.startsWith("/api/")) return null;

  const expenseSharingItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/social", icon: Users, label: "Social Hub" },
    { href: "/settlements", icon: TrendingUp, label: "Settlements" },
    { href: "/gamification", icon: Target, label: "Gamification" },
    { href: "/budget", icon: PiggyBank, label: "Budget Insights" },
  ];

  const personalFinanceItems = [
    { name: "Dashboard", href: "/personal/dashboard", icon: LayoutDashboard },
    { name: "Add Expense", href: "/personal/add-expense", icon: Plus },
    { name: "Categories", href: "/personal/categories", icon: Tag },
    { name: "Monthly View", href: "/personal/monthly-planner", icon: Calendar }
  ];

  const isPersonalFinancePath = pathname.startsWith("/personal");

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Cash Crush</span>
            <span className="truncate text-xs">Expense Manager</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Section Toggle */}
        <SidebarGroup>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={selectedSection === "expense-sharing" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedSection("expense-sharing")}
              className="flex-1 text-xs"
            >
              Expenses
            </Button>
            <Button
              variant={selectedSection === "personal-finance" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedSection("personal-finance")}
              className="flex-1 text-xs"
            >
              Personal
            </Button>
          </div>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Navigation Items */}
        {selectedSection === "expense-sharing" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Expense Sharing</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {expenseSharingItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <IconComponent className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Personal Finance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {personalFinanceItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <IconComponent className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Quick Actions */}
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/expenses/new">
                    <Plus className="w-4 h-4" />
                    <span>Add Group Expense</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/personal/add-expense">
                    <Plus className="w-4 h-4" />
                    <span>Add Personal Expense</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
