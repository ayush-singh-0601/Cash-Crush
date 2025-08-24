"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  PiggyBank,
  CreditCard,
  BarChart3,
  Plus
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function PersonalDashboard() {
  const budget = useQuery(api.personalFinance.getPersonalBudget);
  const dailyStatus = useQuery(api.personalFinance.getDailyBudgetStatus);
  const insights = useQuery(api.personalFinance.getSpendingInsights);
  const goals = useQuery(api.personalFinance.getFinancialGoals, { status: "active" });
  const notifications = useQuery(api.personalFinance.getSmartNotifications, { dismissed: false });
  const healthScore = useQuery(api.personalFinance.getFinancialHealthScore);

  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (!budget) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <PiggyBank className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Personal Finance</h2>
          <p className="text-gray-600 mb-6">Set up your budget to start tracking your personal expenses</p>
          <Link href="/personal/setup">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Set Up Budget
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal Finance</h1>
          <p className="text-gray-600">Track your spending, achieve your goals</p>
        </div>
        <div className="flex gap-2">
          <Link href="/personal/add-expense">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Budget Status */}
        <Card className={dailyStatus?.isOverBudget ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Today's Budget
              {dailyStatus?.isOverBudget ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{Math.abs(dailyStatus?.remaining || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailyStatus?.remaining >= 0 ? "remaining today" : "over daily budget"}
            </p>
            <Progress 
              value={Math.min(dailyStatus?.percentageUsed || 0, 100)} 
              className={`mt-2 ${dailyStatus?.isOverBudget ? 'bg-red-200' : 'bg-green-200'}`}
            />
            <p className="text-xs mt-1 text-gray-600">
              Spent: ₹{dailyStatus?.totalSpent || 0} / ₹{dailyStatus?.dailyLimit || 0}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Spending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{insights?.totalExpenses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(insights?.budgetAdherence || 0)}% of budget used
            </p>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              goals in progress
            </p>
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthScore?.overallScore || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              financial health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Notifications */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Smart Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification._id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Budget Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget Limit</span>
                <span className="text-sm">₹{dailyStatus?.dailyLimit || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spent Today</span>
                <span className="text-sm">₹{dailyStatus?.totalSpent || 0}</span>
              </div>
              <Progress 
                value={dailyStatus?.percentageUsed || 0} 
                className={`h-2 ${dailyStatus?.isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}
              />
              
              {dailyStatus?.categorySpending && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Category Breakdown</h4>
                  {Object.entries(dailyStatus.categorySpending).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span>₹{amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simple Budget Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Budget</span>
                <span className="text-sm">₹{budget?.monthlyBudget || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spent This Month</span>
                <span className="text-sm">₹{insights?.totalExpenses || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining</span>
                <span className={`text-sm font-bold ${
                  (budget?.monthlyBudget || 0) - (insights?.totalExpenses || 0) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{Math.abs((budget?.monthlyBudget || 0) - (insights?.totalExpenses || 0))}
                </span>
              </div>
              <Progress 
                value={((insights?.totalExpenses || 0) / (budget?.monthlyBudget || 1)) * 100} 
                className="h-2"
              />
              <p className="text-xs text-gray-500 text-center">
                {Math.round(((insights?.totalExpenses || 0) / (budget?.monthlyBudget || 1)) * 100)}% of monthly budget used
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{currentMonth} Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights?.categoryBreakdown && (
                <div className="space-y-3">
                  {Object.entries(insights.categoryBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category}</span>
                        <span className="text-sm font-medium">₹{amount}</span>
                      </div>
                    ))}
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-bold">₹{insights?.totalExpenses || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Budget Adherence</span>
                  <span>{Math.round(insights?.budgetAdherence || 0)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/personal/add-expense">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </Link>
              <Link href="/personal/monthly-planner">
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Monthly View
                </Button>
              </Link>
              <Link href="/personal/insights">
                <Button variant="outline" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Insights
                </Button>
              </Link>
              <Link href="/personal/categories">
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Categories
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
