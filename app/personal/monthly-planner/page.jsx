"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Plus,
  Edit,
  ArrowLeft,
  ArrowRight,
  Target,
  Wallet
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

export default function MonthlyBudgetPlanner() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [budgetSetup, setBudgetSetup] = useState({
    monthlyIncome: "",
    monthlyBudget: "",
    dailyBudget: "",
    weekendMultiplier: "1",
    rolloverEnabled: true,
    emergencyFund: "",
    savingsGoal: "",
    categoryBudgets: {
      food: "",
      transport: "",
      entertainment: "",
      shopping: "",
      bills: "",
      health: "",
      education: "",
      miscellaneous: ""
    }
  });

  const budget = useQuery(api.personalFinance.getPersonalBudget);
  const insights = useQuery(api.personalFinance.getSpendingInsights, {
    month: selectedMonth.getMonth(),
    year: selectedMonth.getFullYear()
  });
  const expenses = useQuery(api.personalFinance.getPersonalExpenses, {
    startDate: startOfMonth(selectedMonth).getTime(),
    endDate: endOfMonth(selectedMonth).getTime()
  });
  
  const createBudget = useMutation(api.personalFinance.createPersonalBudget);

  const currentMonth = format(selectedMonth, 'MMMM yyyy');
  const isCurrentMonth = selectedMonth.getMonth() === new Date().getMonth() && 
                        selectedMonth.getFullYear() === new Date().getFullYear();

  const categoryEmojis = {
    food: "🍕",
    transport: "🚗",
    entertainment: "🎬", 
    shopping: "🛍️",
    bills: "💡",
    health: "💊",
    education: "📚",
    miscellaneous: "📦"
  };

  const handleSetupBudget = async () => {
    try {
      const categoryBudgets = {};
      Object.keys(budgetSetup.categoryBudgets).forEach(key => {
        categoryBudgets[key] = parseFloat(budgetSetup.categoryBudgets[key]) || 0;
      });

      await createBudget({
        monthlyIncome: parseFloat(budgetSetup.monthlyIncome) || undefined,
        monthlyBudget: parseFloat(budgetSetup.monthlyBudget),
        dailyBudget: parseFloat(budgetSetup.dailyBudget),
        weekendMultiplier: parseFloat(budgetSetup.weekendMultiplier) || undefined,
        rolloverEnabled: budgetSetup.rolloverEnabled,
        emergencyFund: parseFloat(budgetSetup.emergencyFund) || undefined,
        savingsGoal: parseFloat(budgetSetup.savingsGoal) || undefined,
        categoryBudgets
      });

      toast.success("Budget setup completed!");
      setIsSetupDialogOpen(false);
    } catch (error) {
      toast.error("Failed to setup budget");
    }
  };

  const calculateCategorySpending = () => {
    if (!expenses) return {};
    
    const categorySpending = {};
    expenses.forEach(expense => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });
    
    return categorySpending;
  };

  const categorySpending = calculateCategorySpending();
  const totalSpent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const budgetUsed = budget ? (totalSpent / budget.monthlyBudget) * 100 : 0;
  const remainingBudget = budget ? budget.monthlyBudget - totalSpent : 0;

  if (!budget) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <PiggyBank className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Monthly Budget</h2>
          <p className="text-gray-600 mb-6">Configure your income and spending limits to start planning</p>
          <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Set Up Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Monthly Budget Setup</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Income & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="income">Monthly Income (Optional)</Label>
                    <Input
                      id="income"
                      type="number"
                      value={budgetSetup.monthlyIncome}
                      onChange={(e) => setBudgetSetup({...budgetSetup, monthlyIncome: e.target.value})}
                      placeholder="₹50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Monthly Budget Limit</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={budgetSetup.monthlyBudget}
                      onChange={(e) => setBudgetSetup({...budgetSetup, monthlyBudget: e.target.value})}
                      placeholder="₹30000"
                      required
                    />
                  </div>
                </div>

                {/* Daily Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="daily">Daily Budget</Label>
                    <Input
                      id="daily"
                      type="number"
                      value={budgetSetup.dailyBudget}
                      onChange={(e) => setBudgetSetup({...budgetSetup, dailyBudget: e.target.value})}
                      placeholder="₹1000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekend">Weekend Multiplier</Label>
                    <Input
                      id="weekend"
                      type="number"
                      step="0.1"
                      value={budgetSetup.weekendMultiplier}
                      onChange={(e) => setBudgetSetup({...budgetSetup, weekendMultiplier: e.target.value})}
                      placeholder="1.5"
                    />
                  </div>
                </div>

                {/* Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency">Emergency Fund Target</Label>
                    <Input
                      id="emergency"
                      type="number"
                      value={budgetSetup.emergencyFund}
                      onChange={(e) => setBudgetSetup({...budgetSetup, emergencyFund: e.target.value})}
                      placeholder="₹100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="savings">Monthly Savings Goal</Label>
                    <Input
                      id="savings"
                      type="number"
                      value={budgetSetup.savingsGoal}
                      onChange={(e) => setBudgetSetup({...budgetSetup, savingsGoal: e.target.value})}
                      placeholder="₹10000"
                    />
                  </div>
                </div>

                {/* Category Budgets */}
                <div>
                  <Label className="text-base font-medium">Category Budgets</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {Object.keys(budgetSetup.categoryBudgets).map((category) => (
                      <div key={category}>
                        <Label htmlFor={category} className="flex items-center gap-2">
                          <span>{categoryEmojis[category]}</span>
                          <span className="capitalize">{category}</span>
                        </Label>
                        <Input
                          id={category}
                          type="number"
                          value={budgetSetup.categoryBudgets[category]}
                          onChange={(e) => setBudgetSetup({
                            ...budgetSetup,
                            categoryBudgets: {
                              ...budgetSetup.categoryBudgets,
                              [category]: e.target.value
                            }
                          })}
                          placeholder="₹5000"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSetupBudget} className="flex-1">
                    Create Budget Plan
                  </Button>
                  <Button variant="outline" onClick={() => setIsSetupDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Budget Planner</h1>
          <p className="text-gray-600">Plan and track your monthly finances</p>
        </div>
        <Button variant="outline" onClick={() => setIsSetupDialogOpen(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Budget
        </Button>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold">{currentMonth}</h2>
              {isCurrentMonth && <Badge variant="secondary" className="mt-1">Current Month</Badge>}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              disabled={isCurrentMonth}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{budget.monthlyIncome || "Not set"}
            </div>
            <p className="text-xs text-muted-foreground">
              {budget.monthlyIncome ? "income target" : "set income for better planning"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Limit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{budget.monthlyBudget}</div>
            <p className="text-xs text-muted-foreground">monthly spending limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetUsed > 100 ? 'text-red-600' : budgetUsed > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
              ₹{totalSpent}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(budgetUsed)}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            {remainingBudget >= 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(remainingBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget >= 0 ? "under budget" : "over budget"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Budget Usage</span>
              <span className="text-sm font-bold">{Math.round(budgetUsed)}%</span>
            </div>
            <Progress value={Math.min(budgetUsed, 100)} className="h-3" />
            
            {budgetUsed > 100 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-800">Budget Exceeded!</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  You've exceeded your monthly budget by ₹{Math.abs(remainingBudget)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(budget.categoryBudgets).map((category) => {
                const budgetAmount = budget.categoryBudgets[category];
                const spentAmount = categorySpending[category] || 0;
                const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryEmojis[category]}</span>
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{spentAmount} / ₹{budgetAmount}</div>
                        <div className="text-xs text-gray-500">{Math.round(percentage)}% used</div>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${percentage > 100 ? 'bg-red-100' : percentage > 80 ? 'bg-yellow-100' : 'bg-green-100'}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Savings & Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Savings & Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Monthly Savings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Monthly Savings Target</span>
                  <span className="font-bold">₹{budget.savingsGoal || 0}</span>
                </div>
                {budget.monthlyIncome && (
                  <div className="text-sm text-gray-600">
                    Projected Savings: ₹{budget.monthlyIncome - totalSpent}
                    {budget.monthlyIncome - totalSpent >= (budget.savingsGoal || 0) ? (
                      <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 inline ml-2" />
                    )}
                  </div>
                )}
              </div>

              {/* Emergency Fund */}
              {budget.emergencyFund && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Emergency Fund Target</span>
                    <span className="font-bold">₹{budget.emergencyFund}</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  <div className="text-sm text-gray-600 mt-1">30% completed</div>
                </div>
              )}

              {/* Savings Rate */}
              {budget.monthlyIncome && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Savings Rate</h4>
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round(((budget.monthlyIncome - totalSpent) / budget.monthlyIncome) * 100)}%
                  </div>
                  <p className="text-sm text-green-800">
                    {budget.monthlyIncome - totalSpent >= 0 ? "Great job saving!" : "Consider reducing expenses"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {expenses?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{expenses?.length ? Math.round(totalSpent / expenses.length) : 0}
              </div>
              <p className="text-sm text-gray-600">Average Transaction</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {budget.dailyBudget}
              </div>
              <p className="text-sm text-gray-600">Daily Budget Limit</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Budget Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review and adjust category budgets based on actual spending</li>
              <li>• Set up automatic savings transfers to reach your goals</li>
              <li>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
              <li>• Track daily expenses to stay within monthly limits</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
