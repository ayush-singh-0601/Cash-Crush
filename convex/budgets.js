import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Set user budget
export const setBudget = mutation({
  args: {
    monthlyBudget: v.optional(v.number()),
    weeklyBudget: v.optional(v.number()),
    categories: v.optional(v.array(v.object({
      categoryId: v.string(),
      monthlyLimit: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // Check if user already has budget settings
    const existingBudget = await ctx.db
      .query("userBudgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingBudget) {
      // Update existing budget
      await ctx.db.patch(existingBudget._id, {
        monthlyBudget: args.monthlyBudget || existingBudget.monthlyBudget,
        weeklyBudget: args.weeklyBudget || existingBudget.weeklyBudget,
        categories: args.categories || existingBudget.categories,
        updatedAt: Date.now(),
      });
    } else {
      // Create new budget
      await ctx.db.insert("userBudgets", {
        userId: user._id,
        monthlyBudget: args.monthlyBudget,
        weeklyBudget: args.weeklyBudget,
        categories: args.categories || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

// Get user budget
export const getUserBudget = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const budget = await ctx.db
      .query("userBudgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return budget;
  },
});

// Get budget analysis with spending patterns
export const getBudgetAnalysis = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const budget = await ctx.db
      .query("userBudgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!budget) {
      return null;
    }

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const currentWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000)).getTime();

    // Get user's expenses for current month and week
    const allExpenses = await ctx.db.query("expenses").collect();
    const userExpenses = allExpenses.filter(expense => {
      const userSplit = expense.splits.find(split => split.userId === user._id);
      return userSplit && expense.date >= currentMonth;
    });

    // Calculate monthly spending
    let monthlySpent = 0;
    let weeklySpent = 0;
    const categorySpending = {};

    userExpenses.forEach(expense => {
      const userSplit = expense.splits.find(split => split.userId === user._id);
      if (userSplit) {
        monthlySpent += userSplit.amount;
        
        if (expense.date >= currentWeek) {
          weeklySpent += userSplit.amount;
        }

        // Category spending
        const category = expense.category || 'other';
        categorySpending[category] = (categorySpending[category] || 0) + userSplit.amount;
      }
    });

    // Calculate remaining budgets
    const monthlyRemaining = budget.monthlyBudget ? budget.monthlyBudget - monthlySpent : null;
    const weeklyRemaining = budget.weeklyBudget ? budget.weeklyBudget - weeklySpent : null;

    // Check category limits
    const categoryAlerts = [];
    if (budget.categories) {
      budget.categories.forEach(categoryBudget => {
        const spent = categorySpending[categoryBudget.categoryId] || 0;
        const remaining = categoryBudget.monthlyLimit - spent;
        const percentage = (spent / categoryBudget.monthlyLimit) * 100;

        if (percentage >= 80) {
          categoryAlerts.push({
            category: categoryBudget.categoryId,
            spent,
            limit: categoryBudget.monthlyLimit,
            remaining,
            percentage,
            status: percentage >= 100 ? 'exceeded' : 'warning'
          });
        }
      });
    }

    return {
      budget,
      monthlySpent,
      weeklySpent,
      monthlyRemaining,
      weeklyRemaining,
      categorySpending,
      categoryAlerts,
      monthlyProgress: budget.monthlyBudget ? (monthlySpent / budget.monthlyBudget) * 100 : 0,
      weeklyProgress: budget.weeklyBudget ? (weeklySpent / budget.weeklyBudget) * 100 : 0,
    };
  },
});

// Get predictive debt alerts
export const getDebtAlerts = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // Get all expenses and settlements to analyze patterns
    const allExpenses = await ctx.db.query("expenses").collect();
    const allSettlements = await ctx.db.query("settlements").collect();
    
    // Calculate current balances with other users
    const balancesByUser = {};
    const paymentHistory = {};

    // Process expenses
    allExpenses.forEach(expense => {
      const userSplit = expense.splits.find(split => split.userId === user._id);
      
      if (expense.paidByUserId === user._id) {
        // User paid for others
        expense.splits.forEach(split => {
          if (split.userId !== user._id) {
            balancesByUser[split.userId] = (balancesByUser[split.userId] || 0) + split.amount;
          }
        });
      } else if (userSplit) {
        // User owes someone
        balancesByUser[expense.paidByUserId] = (balancesByUser[expense.paidByUserId] || 0) - userSplit.amount;
      }
    });

    // Process settlements to track payment patterns
    allSettlements.forEach(settlement => {
      const otherUserId = settlement.paidByUserId === user._id ? settlement.receivedByUserId : settlement.paidByUserId;
      
      if (!paymentHistory[otherUserId]) {
        paymentHistory[otherUserId] = [];
      }
      
      paymentHistory[otherUserId].push({
        date: settlement.date,
        amount: settlement.amount,
        dayOfWeek: new Date(settlement.date).getDay(),
      });

      // Update balances
      if (settlement.paidByUserId === user._id) {
        balancesByUser[settlement.receivedByUserId] = (balancesByUser[settlement.receivedByUserId] || 0) - settlement.amount;
      } else {
        balancesByUser[settlement.paidByUserId] = (balancesByUser[settlement.paidByUserId] || 0) + settlement.amount;
      }
    });

    // Generate debt alerts with predictions
    const alerts = [];
    
    for (const [userId, balance] of Object.entries(balancesByUser)) {
      if (Math.abs(balance) > 50) { // Only alert for amounts > ₹50
        const otherUser = await ctx.db.get(userId);
        const history = paymentHistory[userId] || [];
        
        // Analyze payment patterns
        let paymentPattern = '';
        if (history.length > 0) {
          const dayFrequency = {};
          history.forEach(payment => {
            dayFrequency[payment.dayOfWeek] = (dayFrequency[payment.dayOfWeek] || 0) + 1;
          });
          
          const mostCommonDay = Object.entries(dayFrequency)
            .sort(([,a], [,b]) => b - a)[0];
          
          if (mostCommonDay) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            paymentPattern = `usually pays on ${dayNames[mostCommonDay[0]]}s`;
          }
        }

        // Calculate average payment time
        const avgDaysBetweenPayments = history.length > 1 
          ? history.reduce((acc, payment, i) => {
              if (i === 0) return acc;
              return acc + (payment.date - history[i-1].date) / (1000 * 60 * 60 * 24);
            }, 0) / (history.length - 1)
          : null;

        alerts.push({
          userId,
          userName: otherUser?.name || 'Unknown',
          userImage: otherUser?.imageUrl,
          balance: Math.abs(balance),
          type: balance > 0 ? 'owes_you' : 'you_owe',
          paymentPattern,
          avgDaysBetweenPayments: avgDaysBetweenPayments ? Math.round(avgDaysBetweenPayments) : null,
          lastPaymentDate: history.length > 0 ? Math.max(...history.map(h => h.date)) : null,
          totalTransactions: history.length,
        });
      }
    }

    // Get seasonal spending patterns
    const seasonalPatterns = await getSeasonalPatterns(ctx, user._id);

    return {
      debtAlerts: alerts.sort((a, b) => b.balance - a.balance),
      seasonalPatterns,
    };
  },
});

// Helper function to analyze seasonal patterns
async function getSeasonalPatterns(ctx, userId) {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
  
  const allExpenses = await ctx.db.query("expenses").collect();
  const userExpenses = allExpenses.filter(expense => {
    const userSplit = expense.splits.find(split => split.userId === userId);
    return userSplit && expense.date >= oneYearAgo;
  });

  const monthlySpending = {};
  const festivalMonths = [9, 10, 11, 2, 3]; // Oct, Nov, Dec, Mar, Apr (Indian festivals)
  
  userExpenses.forEach(expense => {
    const date = new Date(expense.date);
    const month = date.getMonth();
    const userSplit = expense.splits.find(split => split.userId === userId);
    
    if (userSplit) {
      monthlySpending[month] = (monthlySpending[month] || 0) + userSplit.amount;
    }
  });

  // Calculate festival vs non-festival spending
  let festivalSpending = 0;
  let regularSpending = 0;
  let festivalMonthCount = 0;
  let regularMonthCount = 0;

  Object.entries(monthlySpending).forEach(([month, amount]) => {
    if (festivalMonths.includes(parseInt(month))) {
      festivalSpending += amount;
      festivalMonthCount++;
    } else {
      regularSpending += amount;
      regularMonthCount++;
    }
  });

  const avgFestivalSpending = festivalMonthCount > 0 ? festivalSpending / festivalMonthCount : 0;
  const avgRegularSpending = regularMonthCount > 0 ? regularSpending / regularMonthCount : 0;
  
  const festivalIncrease = avgRegularSpending > 0 
    ? ((avgFestivalSpending - avgRegularSpending) / avgRegularSpending) * 100 
    : 0;

  return {
    festivalIncrease: Math.round(festivalIncrease),
    avgFestivalSpending: Math.round(avgFestivalSpending),
    avgRegularSpending: Math.round(avgRegularSpending),
    currentMonthIsFestival: festivalMonths.includes(now.getMonth()),
  };
}

// Check if expense will breach budget
export const checkBudgetBreach = mutation({
  args: {
    amount: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const analysis = await getBudgetAnalysis(ctx, {});
    if (!analysis || !analysis.budget) {
      return null;
    }

    const warnings = [];

    // Check monthly budget
    if (analysis.budget.monthlyBudget) {
      const newMonthlyTotal = analysis.monthlySpent + args.amount;
      if (newMonthlyTotal > analysis.budget.monthlyBudget) {
        const excess = newMonthlyTotal - analysis.budget.monthlyBudget;
        warnings.push({
          type: 'monthly',
          message: `This expense will put you ₹${excess.toFixed(2)} over your monthly budget!`,
          severity: 'high'
        });
      } else if (newMonthlyTotal > analysis.budget.monthlyBudget * 0.9) {
        const remaining = analysis.budget.monthlyBudget - newMonthlyTotal;
        warnings.push({
          type: 'monthly',
          message: `Only ₹${remaining.toFixed(2)} left in your monthly budget after this expense`,
          severity: 'medium'
        });
      }
    }

    // Check weekly budget
    if (analysis.budget.weeklyBudget) {
      const newWeeklyTotal = analysis.weeklySpent + args.amount;
      if (newWeeklyTotal > analysis.budget.weeklyBudget) {
        const excess = newWeeklyTotal - analysis.budget.weeklyBudget;
        warnings.push({
          type: 'weekly',
          message: `This expense will put you ₹${excess.toFixed(2)} over your weekly budget!`,
          severity: 'high'
        });
      }
    }

    // Check category budget
    if (args.category && analysis.budget.categories) {
      const categoryBudget = analysis.budget.categories.find(c => c.categoryId === args.category);
      if (categoryBudget) {
        const currentCategorySpent = analysis.categorySpending[args.category] || 0;
        const newCategoryTotal = currentCategorySpent + args.amount;
        
        if (newCategoryTotal > categoryBudget.monthlyLimit) {
          const excess = newCategoryTotal - categoryBudget.monthlyLimit;
          warnings.push({
            type: 'category',
            message: `This expense will put you ₹${excess.toFixed(2)} over your ${args.category} budget!`,
            severity: 'high'
          });
        }
      }
    }

    return warnings.length > 0 ? warnings : null;
  },
});
