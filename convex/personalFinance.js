import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Personal Budget Management
export const createPersonalBudget = mutation({
  args: {
    monthlyIncome: v.optional(v.number()),
    monthlyBudget: v.number(),
    dailyBudget: v.number(),
    weekendMultiplier: v.optional(v.number()),
    rolloverEnabled: v.boolean(),
    categoryBudgets: v.object({
      food: v.number(),
      transport: v.number(),
      entertainment: v.number(),
      shopping: v.number(),
      bills: v.number(),
      health: v.number(),
      education: v.number(),
      miscellaneous: v.number(),
    }),
    customCategories: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      emoji: v.string(),
      budget: v.number(),
    }))),
    emergencyFund: v.optional(v.number()),
    savingsGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    // Check if budget already exists
    const existingBudget = await ctx.db
      .query("personalBudgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingBudget) {
      // Update existing budget
      return await ctx.db.patch(existingBudget._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      // Create new budget
      return await ctx.db.insert("personalBudgets", {
        userId: user._id,
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getPersonalBudget = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("personalBudgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const getPersonalBudgets = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("personalBudgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Personal Expense Management
export const addPersonalExpense = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.string(),
    date: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    mood: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    const expenseId = await ctx.db.insert("personalExpenses", {
      userId: user._id,
      amount: args.amount,
      category: args.category,
      subcategory: args.subcategory,
      description: args.description,
      date: args.date || Date.now(),
      isRecurring: args.isRecurring || false,
      recurringFrequency: args.recurringFrequency,
      tags: args.tags || [],
      location: args.location,
      paymentMethod: args.paymentMethod,
      receiptUrl: args.receiptUrl,
      mood: args.mood,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Update spending insights and check budget limits
    await updateSpendingInsights(ctx, user._id);
    await checkBudgetLimits(ctx, user._id, args.category, args.amount);

    return expenseId;
  },
});

export const getPersonalExpenses = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    timeframe: v.optional(v.string()), // "day", "week", "month", "quarter", "year"
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let startDate = args.startDate;
    let endDate = args.endDate;

    // Handle timeframe-based queries
    if (args.timeframe && !startDate && !endDate) {
      const now = new Date();
      switch (args.timeframe) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          endDate = startDate + 24 * 60 * 60 * 1000 - 1;
          break;
        case "week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          startDate = startOfWeek.getTime();
          endDate = startDate + 7 * 24 * 60 * 60 * 1000 - 1;
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1).getTime();
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999).getTime();
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1).getTime();
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
          break;
      }
    }

    let query = ctx.db
      .query("personalExpenses")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (startDate && endDate) {
      query = ctx.db
        .query("personalExpenses")
        .withIndex("by_user_date", (q) => 
          q.eq("userId", user._id)
           .gte("date", startDate)
           .lte("date", endDate)
        );
    }

    let expenses = await query.collect();

    if (args.category && args.category !== "all") {
      expenses = expenses.filter(expense => expense.category === args.category);
    }

    if (args.limit) {
      expenses = expenses.slice(0, args.limit);
    }

    return expenses.sort((a, b) => b.date - a.date);
  },
});

// Financial Goals Management
export const createFinancialGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    targetAmount: v.number(),
    currentAmount: v.optional(v.number()),
    deadline: v.number(),
    category: v.string(),
    priority: v.string(),
    milestones: v.optional(v.array(v.object({
      amount: v.number(),
      description: v.string(),
      achieved: v.boolean(),
      achievedAt: v.optional(v.number()),
    }))),
    autoContribution: v.optional(v.object({
      enabled: v.boolean(),
      amount: v.number(),
      frequency: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    return await ctx.db.insert("financialGoals", {
      userId: user._id,
      ...args,
      currentAmount: args.currentAmount || 0,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateGoalProgress = mutation({
  args: {
    goalId: v.id("financialGoals"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found or unauthorized");
    }

    const newAmount = goal.currentAmount + args.amount;
    const isCompleted = newAmount >= goal.targetAmount;

    await ctx.db.patch(args.goalId, {
      currentAmount: newAmount,
      status: isCompleted ? "completed" : goal.status,
      updatedAt: Date.now(),
    });

    // Create achievement notification if goal completed
    if (isCompleted) {
      await ctx.db.insert("smartNotifications", {
        userId: user._id,
        type: "achievement",
        title: "🎉 Goal Achieved!",
        message: `Congratulations! You've reached your goal: ${goal.title}`,
        priority: "high",
        actionRequired: false,
        dismissed: false,
        createdAt: Date.now(),
      });
    }

    return newAmount;
  },
});

export const getFinancialGoals = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let query = ctx.db
      .query("financialGoals")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.status) {
      query = ctx.db
        .query("financialGoals")
        .withIndex("by_user_status", (q) => 
          q.eq("userId", user._id).eq("status", args.status)
        );
    }

    return await query.collect();
  },
});

// Daily Budget Tracking
export const getDailyBudgetStatus = query({
  args: { date: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const targetDate = args.date || Date.now();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get budget
    const budget = await ctx.db
      .query("personalBudgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!budget) return null;

    // Get today's expenses
    const todayExpenses = await ctx.db
      .query("personalExpenses")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", user._id)
         .gte("date", startOfDay.getTime())
         .lte("date", endOfDay.getTime())
      )
      .collect();

    const totalSpent = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const isWeekend = new Date(targetDate).getDay() % 6 === 0;
    const dailyLimit = budget.dailyBudget * (isWeekend && budget.weekendMultiplier ? budget.weekendMultiplier : 1);

    // Category breakdown
    const categorySpending = {};
    todayExpenses.forEach(expense => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    return {
      dailyLimit,
      totalSpent,
      remaining: dailyLimit - totalSpent,
      percentageUsed: (totalSpent / dailyLimit) * 100,
      categorySpending,
      expenseCount: todayExpenses.length,
      isOverBudget: totalSpent > dailyLimit,
      isWeekend,
    };
  },
});

// Spending Insights and Analytics
export const getSpendingInsights = query({
  args: { 
    month: v.optional(v.number()),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const now = new Date();
    const targetMonth = args.month ?? now.getMonth();
    const targetYear = args.year ?? now.getFullYear();

    return await ctx.db
      .query("spendingInsights")
      .withIndex("by_user_month", (q) => 
        q.eq("userId", user._id)
         .eq("year", targetYear)
         .eq("month", targetMonth)
      )
      .first();
  },
});

// Financial Health Score
export const getFinancialHealthScore = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const latest = await ctx.db
      .query("financialHealthMetrics")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    return latest;
  },
});

// Smart Notifications
export const getSmartNotifications = query({
  args: { dismissed: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("smartNotifications")
      .withIndex("by_user_dismissed", (q) => 
        q.eq("userId", user._id).eq("dismissed", args.dismissed ?? false)
      )
      .order("desc")
      .take(20);
  },
});

export const dismissNotification = mutation({
  args: { notificationId: v.id("smartNotifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found or unauthorized");
    }

    await ctx.db.patch(args.notificationId, { dismissed: true });
  },
});

// Recurring Expenses
export const addRecurringExpense = mutation({
  args: {
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    frequency: v.string(),
    nextDueDate: v.number(),
    reminderDays: v.optional(v.number()),
    autoDeduct: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    return await ctx.db.insert("recurringExpenses", {
      userId: user._id,
      ...args,
      reminderDays: args.reminderDays || 3,
      autoDeduct: args.autoDeduct || false,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const getRecurringExpenses = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("recurringExpenses")
      .withIndex("by_user_active", (q) => q.eq("userId", user._id).eq("isActive", true))
      .collect();
  },
});

// Expense Categories
export const getExpenseCategories = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const userCategories = await ctx.db
      .query("expenseCategories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Default categories
    const defaultCategories = [
      { name: "Food & Dining", emoji: "🍕", color: "#FF6B6B", isDefault: true },
      { name: "Transportation", emoji: "🚗", color: "#4ECDC4", isDefault: true },
      { name: "Entertainment", emoji: "🎬", color: "#45B7D1", isDefault: true },
      { name: "Shopping", emoji: "🛍️", color: "#96CEB4", isDefault: true },
      { name: "Bills & Utilities", emoji: "💡", color: "#FFEAA7", isDefault: true },
      { name: "Health & Fitness", emoji: "💊", color: "#DDA0DD", isDefault: true },
      { name: "Education", emoji: "📚", color: "#98D8C8", isDefault: true },
      { name: "Miscellaneous", emoji: "📦", color: "#F7DC6F", isDefault: true },
    ];

    return [...defaultCategories, ...userCategories];
  },
});

export const addCustomCategory = mutation({
  args: {
    name: v.string(),
    emoji: v.string(),
    color: v.string(),
    budgetLimit: v.optional(v.number()),
    subcategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    return await ctx.db.insert("expenseCategories", {
      userId: user._id,
      ...args,
      isDefault: false,
      createdAt: Date.now(),
    });
  },
});

// Financial Health Metrics
export const getFinancialHealthMetrics = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("financialHealthMetrics")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
  },
});

export const getCashFlowForecasts = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("cashFlowForecasts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(12); // Last 12 months
  },
});

// Helper Functions
async function updateSpendingInsights(ctx, userId) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Get month's expenses
  const startOfMonth = new Date(year, month, 1).getTime();
  const endOfMonth = new Date(year, month + 1, 0).getTime();

  const monthExpenses = await ctx.db
    .query("personalExpenses")
    .withIndex("by_user_date", (q) => 
      q.eq("userId", userId)
       .gte("date", startOfMonth)
       .lte("date", endOfMonth)
    )
    .collect();

  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Category breakdown
  const categoryBreakdown = {
    food: 0, transport: 0, entertainment: 0, shopping: 0,
    bills: 0, health: 0, education: 0, miscellaneous: 0
  };

  monthExpenses.forEach(expense => {
    if (categoryBreakdown.hasOwnProperty(expense.category)) {
      categoryBreakdown[expense.category] += expense.amount;
    } else {
      categoryBreakdown.miscellaneous += expense.amount;
    }
  });

  // Calculate spending trends
  const weekdayExpenses = monthExpenses.filter(exp => {
    const day = new Date(exp.date).getDay();
    return day >= 1 && day <= 5;
  });
  
  const weekendExpenses = monthExpenses.filter(exp => {
    const day = new Date(exp.date).getDay();
    return day === 0 || day === 6;
  });

  const weekdayAvg = weekdayExpenses.length > 0 ? 
    weekdayExpenses.reduce((sum, exp) => sum + exp.amount, 0) / weekdayExpenses.length : 0;
  
  const weekendAvg = weekendExpenses.length > 0 ? 
    weekendExpenses.reduce((sum, exp) => sum + exp.amount, 0) / weekendExpenses.length : 0;

  // Generate recommendations
  const recommendations = generateRecommendations(categoryBreakdown, totalExpenses);

  // Check if insights already exist
  const existingInsights = await ctx.db
    .query("spendingInsights")
    .withIndex("by_user_month", (q) => 
      q.eq("userId", userId).eq("year", year).eq("month", month)
    )
    .first();

  const insightsData = {
    userId,
    month,
    year,
    totalExpenses,
    totalSavings: 0, // Calculate based on budget vs spending
    categoryBreakdown,
    spendingTrends: {
      weekdayAvg,
      weekendAvg,
      dailyPattern: [0, 0, 0, 0, 0, 0, 0], // Calculate 7-day pattern
      peakSpendingDay: "Monday", // Calculate actual peak
      lowestSpendingDay: "Sunday", // Calculate actual lowest
    },
    budgetAdherence: 85, // Calculate based on budget
    financialHealthScore: 75, // Calculate comprehensive score
    recommendations,
    createdAt: Date.now(),
  };

  if (existingInsights) {
    await ctx.db.patch(existingInsights._id, insightsData);
  } else {
    await ctx.db.insert("spendingInsights", insightsData);
  }
}

async function checkBudgetLimits(ctx, userId, category, amount) {
  const budget = await ctx.db
    .query("personalBudgets")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!budget) return;

  // Check daily budget
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

  const todayExpenses = await ctx.db
    .query("personalExpenses")
    .withIndex("by_user_date", (q) => 
      q.eq("userId", userId)
       .gte("date", startOfDay)
       .lte("date", endOfDay)
    )
    .collect();

  const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  if (todayTotal > budget.dailyBudget * 0.8) {
    await ctx.db.insert("smartNotifications", {
      userId,
      type: "budget_warning",
      title: "Daily Budget Alert",
      message: `You've spent ₹${todayTotal} today (${Math.round((todayTotal/budget.dailyBudget)*100)}% of daily budget)`,
      priority: todayTotal > budget.dailyBudget ? "high" : "medium",
      category,
      amount: todayTotal,
      actionRequired: false,
      dismissed: false,
      createdAt: Date.now(),
    });
  }
}

function generateRecommendations(categoryBreakdown, totalExpenses) {
  const recommendations = [];
  
  // Find highest spending category
  const maxCategory = Object.keys(categoryBreakdown).reduce((a, b) => 
    categoryBreakdown[a] > categoryBreakdown[b] ? a : b
  );
  
  if (categoryBreakdown[maxCategory] > totalExpenses * 0.4) {
    recommendations.push(`Consider reducing ${maxCategory} expenses - it's 40%+ of your spending`);
  }
  
  if (categoryBreakdown.entertainment > categoryBreakdown.food) {
    recommendations.push("You're spending more on entertainment than food - consider rebalancing");
  }
  
  if (totalExpenses > 50000) {
    recommendations.push("High monthly spending detected - review and optimize major expenses");
  }
  
  return recommendations;
}

// Get recent expenses for smart suggestions
export const getRecentExpenses = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    const limit = args.limit || 10;
    
    return await ctx.db
      .query("personalExpenses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});
