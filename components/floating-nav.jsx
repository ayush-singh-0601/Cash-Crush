"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { 
  Users, 
  User, 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  PiggyBank,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Tag,
  CalendarDays,
  Brain,
  Heart
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FloatingNav() {
  const [activeSection, setActiveSection] = useState("expense-sharing");
  const pathname = usePathname();

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
    { name: "Daily Budget", href: "/personal/daily-budget", icon: Calendar },
    { name: "Categories", href: "/personal/categories", icon: Tag },
    { name: "Monthly Planner", href: "/personal/monthly-planner", icon: CalendarDays },
    { name: "Analytics", href: "/personal/analytics", icon: BarChart3 },
    { name: "Goals", href: "/personal/goals", icon: Target },
    { name: "Add Expense", href: "/personal/add-expense", icon: Plus },
    { name: "Setup", href: "/personal/setup", icon: Settings },
    { name: "Insights", href: "/personal/insights", icon: Brain },
    { name: "Health Score", href: "/personal/health-score", icon: Heart },
    { name: "Predictions", href: "/personal/predictions", icon: TrendingUp }
  ];

  const isPersonalFinancePath = pathname.startsWith("/personal");

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4">
        {/* Section Toggle */}
        <div className="flex items-center justify-center py-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveSection("expense-sharing")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                !isPersonalFinancePath
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Users className="w-4 h-4" />
              Expense Sharing
            </button>
            <button
              onClick={() => setActiveSection("personal-finance")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                isPersonalFinancePath
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <User className="w-4 h-4" />
              Personal Finance
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center justify-center pb-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(isPersonalFinancePath ? personalFinanceItems : expenseSharingItems).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    isActive
                      ? isPersonalFinancePath
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Quick Add Button */}
            <div className="ml-4 pl-4 border-l border-gray-200">
              <Link
                href={isPersonalFinancePath ? "/personal/add-expense" : "/expenses/new"}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isPersonalFinancePath
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                )}
              >
                <Plus className="w-4 h-4" />
                Add {isPersonalFinancePath ? "Expense" : "Group Expense"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
