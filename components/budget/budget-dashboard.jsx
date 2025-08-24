"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Calendar,
  DollarSign,
  Settings,
  Bell,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { BudgetSetupModal } from "./budget-setup-modal";
import { getCategoryById } from "@/lib/expense-categories";

export function BudgetDashboard() {
  const budgetAnalysis = useConvexQuery(api.budgets.getBudgetAnalysis);
  const debtAlerts = useConvexQuery(api.budgets.getDebtAlerts);

  if (budgetAnalysis.isLoading || debtAlerts.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-gray-100 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  if (!budgetAnalysis?.data?.budget) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Budget Set</h3>
        <p className="text-muted-foreground mb-6">
          Set up your monthly and weekly budgets to track spending and get smart alerts
        </p>
        <BudgetSetupModal>
          <Button size="lg" className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Set Up Budget
          </Button>
        </BudgetSetupModal>
      </motion.div>
    );
  }

  const { budget, monthlySpent, weeklySpent, monthlyRemaining, weeklyRemaining, categoryAlerts, monthlyProgress, weeklyProgress } = budgetAnalysis.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Dashboard</h2>
          <p className="text-muted-foreground">Track your spending and stay on budget</p>
        </div>
        <BudgetSetupModal existingBudget={budget}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit Budget
          </Button>
        </BudgetSetupModal>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Budget */}
        {budget.monthlyBudget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className={monthlyProgress >= 100 ? "border-red-200 bg-red-50" : monthlyProgress >= 80 ? "border-yellow-200 bg-yellow-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Budget
                  </span>
                  <Badge variant={monthlyProgress >= 100 ? "destructive" : monthlyProgress >= 80 ? "secondary" : "default"}>
                    {monthlyProgress.toFixed(0)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Spent: ₹{monthlySpent.toLocaleString()}</span>
                    <span>Budget: ₹{budget.monthlyBudget.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min(monthlyProgress, 100)} className="h-3" />
                  <div className="flex items-center gap-2">
                    {monthlyRemaining >= 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          ₹{monthlyRemaining.toLocaleString()} remaining
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          ₹{Math.abs(monthlyRemaining).toLocaleString()} over budget
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Weekly Budget */}
        {budget.weeklyBudget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={weeklyProgress >= 100 ? "border-red-200 bg-red-50" : weeklyProgress >= 80 ? "border-yellow-200 bg-yellow-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Budget
                  </span>
                  <Badge variant={weeklyProgress >= 100 ? "destructive" : weeklyProgress >= 80 ? "secondary" : "default"}>
                    {weeklyProgress.toFixed(0)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Spent: ₹{weeklySpent.toLocaleString()}</span>
                    <span>Budget: ₹{budget.weeklyBudget.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min(weeklyProgress, 100)} className="h-3" />
                  <div className="flex items-center gap-2">
                    {weeklyRemaining >= 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          ₹{weeklyRemaining.toLocaleString()} remaining
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          ₹{Math.abs(weeklyRemaining).toLocaleString()} over budget
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Category Alerts */}
      {categoryAlerts && categoryAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Category Budget Alerts
              </CardTitle>
              <CardDescription>
                Some categories are approaching or exceeding their limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryAlerts.map((alert, index) => {
                  const category = getCategoryById(alert.category);
                  const Icon = category?.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {Icon ? <Icon className="h-5 w-5" /> : "📊"}
                        </span>
                        <div>
                          <p className="font-medium">{category?.name || alert.category}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{alert.spent.toLocaleString()} / ₹{alert.limit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.status === "exceeded" ? "destructive" : "secondary"}>
                          {alert.percentage.toFixed(0)}%
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.status === "exceeded" 
                            ? `₹${Math.abs(alert.remaining).toLocaleString()} over`
                            : `₹${alert.remaining.toLocaleString()} left`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Debt Alerts */}
      {debtAlerts?.data?.debtAlerts && debtAlerts.data.debtAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Debt Alerts
              </CardTitle>
              <CardDescription>
                Smart predictions based on payment patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debtAlerts.data.debtAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {alert.userImage ? (
                          <img src={alert.userImage} alt={alert.userName} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-sm font-medium">{alert.userName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {alert.type === "owes_you" 
                            ? `${alert.userName} owes you ₹${alert.balance.toLocaleString()}`
                            : `You owe ${alert.userName} ₹${alert.balance.toLocaleString()}`
                          }
                        </p>
                        {alert.paymentPattern && (
                          <p className="text-sm text-muted-foreground">
                            {alert.paymentPattern}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {alert.type === "owes_you" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Seasonal Patterns */}
      {debtAlerts?.data?.seasonalPatterns && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Spending Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {debtAlerts.data.seasonalPatterns.festivalIncrease > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-800">Festival Season Impact</p>
                      <p className="text-sm text-blue-600">
                        You spend {debtAlerts.data.seasonalPatterns.festivalIncrease}% more during festival months
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                )}
                
                {debtAlerts.data.seasonalPatterns.currentMonthIsFestival && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-yellow-800">Festival Month Alert</p>
                      <p className="text-sm text-yellow-600">
                        This is typically a high-spending month. Budget accordingly!
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
