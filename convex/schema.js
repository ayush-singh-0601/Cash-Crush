import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
    // TEMP: accept legacy UPI id during migration; remove later
    upiId: v.optional(v.string()),
    // Gamification fields
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    lastExpenseDate: v.optional(v.number()),
    gamificationPoints: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

  expenses: defineTable({
    description: v.string(),
    amount: v.number(),
    category: v.optional(v.string()),
    date: v.number(),
    paidByUserId: v.id("users"),
    splitType: v.string(),
    splits: v.array(
      v.object({
        userId: v.id("users"),
        amount: v.number(),
        paid: v.boolean(),
      })
    ),
    groupId: v.optional(v.id("groups")),
    createdBy: v.id("users"),
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_date", ["date"]),
    // Settlements between users or within groups
  settlements: defineTable({
    amount: v.number(),
    date: v.number(),
    paidByUserId: v.id("users"),
    receivedByUserId: v.id("users"),
    createdBy: v.id("users"),
    note: v.optional(v.string()),
    notes: v.optional(v.string()), // Temporary field for migration
    method: v.optional(v.string()), // e.g., 'cash', 'other'
    paymentMethod: v.optional(v.string()), // TEMP: accept legacy field for migration
    groupId: v.optional(v.id("groups")),
    relatedExpenseIds: v.optional(v.array(v.id("expenses"))),
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_receiver_and_group", ["receivedByUserId", "groupId"])
    .index("by_date", ["date"]),


  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdBy: v.id("users"),
    members: v.array(
      v.object({
        userId: v.id("users"), 
        role: v.string(), 
        joinedAt: v.number(),
      })
    ),
    activeChallengeId: v.optional(v.id("groupChallenges")),
  })
    .index("by_user", ["members"]),

  // Social Features Tables
  expenseReactions: defineTable({
    expenseId: v.id("expenses"),
    userId: v.id("users"),
    emoji: v.string(),
    createdAt: v.number(),
  })
    .index("by_expense", ["expenseId"])
    .index("by_user", ["userId"])
    .index("by_expense_user", ["expenseId", "userId"]),

  expenseComments: defineTable({
    expenseId: v.id("expenses"),
    userId: v.id("users"),
    comment: v.string(),
    createdAt: v.number(),
  })
    .index("by_expense", ["expenseId"])
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"]),

  groupMessages: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    message: v.string(),
    messageType: v.string(), // "text", "expense_added", "settlement_made", "system"
    relatedExpenseId: v.optional(v.id("expenses")),
    relatedSettlementId: v.optional(v.id("settlements")),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_date", ["groupId", "createdAt"]),

  feedActivities: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    activityType: v.string(), // "expense_added", "expense_updated", "settlement_made", "comment_added", "reaction_added"
    title: v.string(),
    description: v.optional(v.string()),
    relatedExpenseId: v.optional(v.id("expenses")),
    relatedSettlementId: v.optional(v.id("settlements")),
    relatedCommentId: v.optional(v.id("expenseComments")),
    metadata: v.optional(v.object({
      amount: v.optional(v.number()),
      emoji: v.optional(v.string()),
      category: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_date", ["groupId", "createdAt"])
    .index("by_activity_type", ["activityType"]),

  // Enhanced Gamification Tables
  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
  })
    .index("by_name", ["name"]),

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    points: v.number(),
    awardedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_achievement", ["userId", "achievementId"]),

  // Challenge System
  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("saving"), v.literal("spending_limit"), v.literal("category_limit")),
    targetAmount: v.number(),
    category: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    isPublic: v.boolean(),
    createdBy: v.id("users"),
    participants: v.array(v.id("users")),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    createdAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  challengeParticipants: defineTable({
    challengeId: v.id("challenges"),
    userId: v.id("users"),
    joinedAt: v.number(),
    currentAmount: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("dropped")),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_user", ["userId"])
    .index("by_challenge_user", ["challengeId", "userId"]),

  challengeInvitations: defineTable({
    challengeId: v.id("challenges"),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_sender", ["fromUserId"])
    .index("by_recipient", ["toUserId"]),

  // Gamification: Group Challenges
  groupChallenges: defineTable({
    groupId: v.id("groups"),
    name: v.string(),
    description: v.string(),
    goalAmount: v.number(),
    currentAmount: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdBy: v.id("users"),
  })
    .index("by_group", ["groupId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    type: v.string(), // e.g., 'achievement_unlocked', 'challenge_completed'
    read: v.boolean(),
    link: v.optional(v.string()), // e.g., '/gamification'
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Budget Management Tables
  userBudgets: defineTable({
    userId: v.id("users"),
    monthlyBudget: v.optional(v.number()),
    weeklyBudget: v.optional(v.number()),
    categories: v.optional(v.array(v.object({
      categoryId: v.string(),
      monthlyLimit: v.number(),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  budgetAlerts: defineTable({
    userId: v.id("users"),
    alertType: v.string(), // 'monthly_breach', 'weekly_breach', 'category_breach', 'debt_reminder'
    message: v.string(),
    severity: v.string(), // 'low', 'medium', 'high'
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    relatedUserId: v.optional(v.id("users")), // For debt alerts
    acknowledged: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_acknowledged", ["userId", "acknowledged"])
    .index("by_severity", ["severity"]),

  userSpendingPatterns: defineTable({
    userId: v.id("users"),
    month: v.number(), // Month number (0-11)
    year: v.number(),
    totalSpent: v.number(),
    categoryBreakdown: v.object({
      food: v.optional(v.number()),
      transport: v.optional(v.number()),
      entertainment: v.optional(v.number()),
      shopping: v.optional(v.number()),
      bills: v.optional(v.number()),
      other: v.optional(v.number()),
    }),
    expenseCount: v.number(),
    avgExpenseAmount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "year", "month"]),

  // Personal Finance Tables
  personalBudgets: defineTable({
    userId: v.id("users"),
    monthlyIncome: v.optional(v.number()),
    monthlyBudget: v.number(),
    dailyBudget: v.number(),
    weekendMultiplier: v.optional(v.number()), // Different budget for weekends
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  personalExpenses: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.string(),
    date: v.number(),
    isRecurring: v.boolean(),
    recurringFrequency: v.optional(v.string()), // "daily", "weekly", "monthly"
    tags: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    paymentMethod: v.optional(v.string()), // "cash", "card", "upi", "other"
    receiptUrl: v.optional(v.string()),
    mood: v.optional(v.string()), // "happy", "stressed", "neutral", "sad", "excited"
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_category", ["userId", "category"])
    .index("by_recurring", ["isRecurring"]),

  financialGoals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    targetAmount: v.number(),
    currentAmount: v.number(),
    deadline: v.number(),
    category: v.string(), // "savings", "purchase", "debt", "investment", "emergency"
    priority: v.string(), // "high", "medium", "low"
    status: v.string(), // "active", "completed", "paused", "cancelled"
    milestones: v.optional(v.array(v.object({
      amount: v.number(),
      description: v.string(),
      achieved: v.boolean(),
      achievedAt: v.optional(v.number()),
    }))),
    autoContribution: v.optional(v.object({
      enabled: v.boolean(),
      amount: v.number(),
      frequency: v.string(), // "daily", "weekly", "monthly"
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_priority", ["priority"]),

  spendingInsights: defineTable({
    userId: v.id("users"),
    month: v.number(),
    year: v.number(),
    totalIncome: v.optional(v.number()),
    totalExpenses: v.number(),
    totalSavings: v.number(),
    categoryBreakdown: v.object({
      food: v.number(),
      transport: v.number(),
      entertainment: v.number(),
      shopping: v.number(),
      bills: v.number(),
      health: v.number(),
      education: v.number(),
      miscellaneous: v.number(),
    }),
    spendingTrends: v.object({
      weekdayAvg: v.number(),
      weekendAvg: v.number(),
      dailyPattern: v.array(v.number()), // 7 days average
      peakSpendingDay: v.string(),
      lowestSpendingDay: v.string(),
    }),
    budgetAdherence: v.number(), // Percentage
    financialHealthScore: v.number(), // 0-100
    recommendations: v.array(v.string()),
    achievements: v.optional(v.array(v.string())),
    warnings: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "year", "month"]),

  recurringExpenses: defineTable({
    userId: v.id("users"),
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    frequency: v.string(), // "daily", "weekly", "monthly", "yearly"
    nextDueDate: v.number(),
    lastPaidDate: v.optional(v.number()),
    isActive: v.boolean(),
    autoDeduct: v.boolean(),
    reminderDays: v.number(), // Days before due date to remind
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_due_date", ["nextDueDate"]),

  cashFlowForecasts: defineTable({
    userId: v.id("users"),
    month: v.number(),
    year: v.number(),
    projectedIncome: v.number(),
    projectedExpenses: v.number(),
    projectedSavings: v.number(),
    categoryForecasts: v.object({
      food: v.number(),
      transport: v.number(),
      entertainment: v.number(),
      shopping: v.number(),
      bills: v.number(),
      health: v.number(),
      education: v.number(),
      miscellaneous: v.number(),
    }),
    confidenceScore: v.number(), // 0-100
    riskFactors: v.array(v.string()),
    opportunities: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "year", "month"]),

  financialHealthMetrics: defineTable({
    userId: v.id("users"),
    date: v.number(),
    overallScore: v.number(), // 0-100
    budgetAdherenceScore: v.number(), // 40% weight
    savingsRateScore: v.number(), // 30% weight
    categoryBalanceScore: v.number(), // 20% weight
    debtManagementScore: v.number(), // 10% weight
    streakDays: v.number(), // Days under budget
    longestStreak: v.number(),
    improvements: v.array(v.string()),
    concerns: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  smartNotifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "budget_warning", "goal_progress", "spending_pattern", "bill_reminder", "achievement"
    title: v.string(),
    message: v.string(),
    priority: v.string(), // "low", "medium", "high", "urgent"
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    actionRequired: v.boolean(),
    actionUrl: v.optional(v.string()),
    dismissed: v.boolean(),
    scheduledFor: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_dismissed", ["userId", "dismissed"])
    .index("by_priority", ["priority"])
    .index("by_scheduled", ["scheduledFor"]),

  expenseCategories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    emoji: v.string(),
    color: v.string(),
    isDefault: v.boolean(),
    subcategories: v.optional(v.array(v.string())),
    budgetLimit: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_default", ["userId", "isDefault"]),
});
