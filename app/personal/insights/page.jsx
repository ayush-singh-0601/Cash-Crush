"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Calendar,
  PiggyBank,
  CreditCard,
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Heart,
  BookOpen,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign
} from "lucide-react";

export default function SmartInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  
  const expenses = useQuery(api.personalFinance.getPersonalExpenses, {
    timeframe: selectedTimeframe
  });
  const budgets = useQuery(api.personalFinance.getPersonalBudgets);
  const goals = useQuery(api.personalFinance.getFinancialGoals);
  const insights = useQuery(api.personalFinance.getSpendingInsights);

  // Smart insights calculations
  const generateSmartInsights = () => {
    if (!expenses || !budgets) return [];

    const insights = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate spending patterns
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    if (!monthlyExpenses || monthlyExpenses.length === 0) {
      return [{
        type: "info",
        title: "Start Tracking",
        description: "Add your first expense to get basic spending insights.",
        action: "Add expense",
        priority: "high",
        icon: Plus,
        color: "text-blue-600"
      }];
    }

    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Category analysis
    const categorySpending = {};
    monthlyExpenses.forEach(expense => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    // Top spending category
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      const [category, amount] = topCategory;
      const percentage = ((amount / totalSpent) * 100).toFixed(1);
      
      insights.push({
        type: "insight",
        title: "Top Spending Category",
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} accounts for ${percentage}% of your spending (₹${amount}).`,
        action: "View category details",
        priority: "medium",
        icon: getIconForCategory(category),
        color: "text-purple-600"
      });
    }

    // Monthly total
    insights.push({
      type: "info",
      title: "Monthly Spending",
      description: `You've spent ₹${totalSpent} this month across ${monthlyExpenses.length} transactions.`,
      action: "View all expenses",
      priority: "low",
      icon: TrendingUp,
      color: "text-indigo-600"
    });

    return insights.slice(0, 3); // Keep it simple with just 3 insights
  };

  const getIconForCategory = (category) => {
    const icons = {
      food: Coffee,
      transport: Car,
      entertainment: Sparkles,
      shopping: ShoppingCart,
      bills: Home,
      health: Heart,
      education: BookOpen,
      miscellaneous: DollarSign
    };
    return icons[category] || DollarSign;
  };

  const smartInsights = generateSmartInsights();

  // AI-powered recommendations
  const aiRecommendations = [
    {
      title: "Optimize Food Spending",
      description: "You spend 35% more on food than similar users. Try meal planning and cooking at home 2 more days per week.",
      impact: "Save ₹3,500/month",
      difficulty: "Easy",
      category: "food",
      icon: Coffee
    },
    {
      title: "Transportation Efficiency",
      description: "Consider carpooling or public transport for 40% of your trips to reduce transport costs.",
      impact: "Save ₹2,200/month",
      difficulty: "Medium",
      category: "transport",
      icon: Car
    },
    {
      title: "Subscription Audit",
      description: "You have 6 active subscriptions. Cancel unused ones and switch to annual plans for 20% savings.",
      impact: "Save ₹1,800/month",
      difficulty: "Easy",
      category: "entertainment",
      icon: Sparkles
    },
    {
      title: "Emergency Fund Boost",
      description: "Your emergency fund is 60% complete. Automate ₹5,000 monthly transfers to reach your goal faster.",
      impact: "Financial security",
      difficulty: "Easy",
      category: "savings",
      icon: PiggyBank
    }
  ];

  const spendingTrends = [
    { month: "Jan", amount: 28500, budget: 30000 },
    { month: "Feb", amount: 31200, budget: 30000 },
    { month: "Mar", amount: 29800, budget: 30000 },
    { month: "Apr", amount: 33500, budget: 30000 },
    { month: "May", amount: 27900, budget: 30000 },
    { month: "Jun", amount: 32100, budget: 30000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Smart Insights
          </h1>
          <p className="text-gray-600">AI-powered financial recommendations and insights</p>
        </div>
        
        <div className="flex gap-2">
          {["week", "month", "quarter"].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className="capitalize"
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartInsights.slice(0, 6).map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-5 h-5 ${insight.color}`} />
                    <Badge variant={
                      insight.type === "warning" ? "destructive" :
                      insight.type === "positive" ? "default" : "secondary"
                    }>
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  {insight.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiRecommendations.map((rec, index) => {
              const IconComponent = rec.icon;
              return (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {rec.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs text-green-700">
                            {rec.impact}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Spending Trends Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Spending Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingTrends.slice(-3).map((trend, index) => {
                const isOverBudget = trend.amount > trend.budget;
                const percentage = (trend.amount / trend.budget) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{trend.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          ₹{trend.amount.toLocaleString()}
                        </span>
                        {isOverBudget ? (
                          <ArrowUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}
                    />
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of budget
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Goal Progress Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Emergency Fund</span>
                </div>
                <Progress value={65} className="mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">₹65,000 / ₹100,000</span>
                  <span className="text-blue-600">65% complete</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  At current rate, you'll reach your goal in 8 months
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Vacation Fund</span>
                </div>
                <Progress value={40} className="mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">₹20,000 / ₹50,000</span>
                  <span className="text-green-600">40% complete</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Increase monthly contribution by ₹2,000 to meet deadline
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Education Fund</span>
                </div>
                <Progress value={25} className="mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">₹12,500 / ₹50,000</span>
                  <span className="text-purple-600">25% complete</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Consider automating contributions for consistent progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Smart Alerts & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">Budget Alert</span>
              </div>
              <p className="text-sm text-red-800">
                At current spending rate, you'll exceed monthly budget by ₹4,500
              </p>
            </div>

            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">Bill Reminder</span>
              </div>
              <p className="text-sm text-yellow-800">
                Electricity bill (₹2,800) due in 3 days. Budget impact: 9.3%
              </p>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">Savings Win</span>
              </div>
              <p className="text-sm text-green-800">
                You're ₹1,200 under food budget this month. Great job!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
