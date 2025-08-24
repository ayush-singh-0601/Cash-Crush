import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Achievement types and their criteria
const ACHIEVEMENTS = {
  // Challenge-related achievements
  CHALLENGE_WINNER: {
    id: "challenge_winner",
    title: "Challenge Champion",
    description: "Win your first challenge",
    icon: "🏆",
    points: 100,
  },
  CHALLENGE_STREAK: {
    id: "challenge_streak",
    title: "Streak Master",
    description: "Win 3 challenges in a row",
    icon: "🔥",
    points: 250,
  },
  BUDGET_MASTER: {
    id: "budget_master",
    title: "Budget Master",
    description: "Stay under budget for 30 days",
    icon: "💰",
    points: 200,
  },
  SAVING_HERO: {
    id: "saving_hero",
    title: "Saving Hero",
    description: "Save ₹10,000 in challenges",
    icon: "🦸",
    points: 300,
  },
  SOCIAL_BUTTERFLY: {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Invite 10 friends to challenges",
    icon: "🦋",
    points: 150,
  },
  EARLY_BIRD: {
    id: "early_bird",
    title: "Early Bird",
    description: "Join a challenge within first hour",
    icon: "🐦",
    points: 50,
  },
  CONSISTENT_TRACKER: {
    id: "consistent_tracker",
    title: "Consistent Tracker",
    description: "Log expenses for 7 days straight",
    icon: "📊",
    points: 75,
  },
  BIG_SPENDER: {
    id: "big_spender",
    title: "Big Spender",
    description: "Track ₹50,000 in total expenses",
    icon: "💸",
    points: 200,
  },
};

// Award achievement to user
export const awardAchievement = mutation({
  args: {
    userId: v.id("users"),
    achievementId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already has this achievement
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_achievement", (q) => 
        q.eq("userId", args.userId).eq("achievementId", args.achievementId)
      )
      .first();

    if (existing) {
      return false; // Already has achievement
    }

    const achievement = ACHIEVEMENTS[args.achievementId.toUpperCase()];
    if (!achievement) {
      throw new Error("Invalid achievement ID");
    }

    // Award the achievement
    await ctx.db.insert("userAchievements", {
      userId: args.userId,
      achievementId: args.achievementId,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      points: achievement.points,
      awardedAt: Date.now(),
    });

    // Update user's total points
    const user = await ctx.db.get(args.userId);
    const currentPoints = user.gamificationPoints || 0;
    await ctx.db.patch(args.userId, {
      gamificationPoints: currentPoints + achievement.points,
    });

    return true;
  },
});

// Get user achievements
export const getUserAchievements = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId 
      ? await ctx.db.get(args.userId)
      : await ctx.runQuery(internal.users.getCurrentUser);

    const achievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get all available achievements with earned status
    const allAchievements = Object.values(ACHIEVEMENTS).map(achievement => {
      const earned = achievements.find(a => a.achievementId === achievement.id);
      return {
        ...achievement,
        earned: !!earned,
        awardedAt: earned?.awardedAt,
      };
    });

    return {
      achievements: allAchievements,
      totalPoints: user.gamificationPoints || 0,
      earnedCount: achievements.length,
      totalCount: Object.keys(ACHIEVEMENTS).length,
    };
  },
});

// Check and award challenge-related achievements
export const checkChallengeAchievements = mutation({
  args: {
    userId: v.id("users"),
    challengeId: v.id("challenges"),
    newAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    
    // Check if challenge is completed and user won
    if (challenge.status === "completed") {
      const leaderboard = await ctx.runQuery(internal.challenges.getChallengeLeaderboard, {
        challengeId: args.challengeId,
      });
      
      const userRank = leaderboard.find(entry => entry.userId === args.userId)?.rank;
      
      if (userRank === 1) {
        await ctx.runMutation(internal.achievements.awardAchievement, {
          userId: args.userId,
          achievementId: "challenge_winner",
        });
        
        // Check for streak
        await checkChallengeStreak(ctx, args.userId);
      }
    }

    // Check saving milestones
    if (challenge.type === "saving" && args.newAmount >= 10000) {
      await ctx.runMutation(internal.achievements.awardAchievement, {
        userId: args.userId,
        achievementId: "saving_hero",
      });
    }
  },
});

// Helper function to check challenge winning streak
async function checkChallengeStreak(ctx, userId) {
  const recentChallenges = await ctx.db
    .query("challengeParticipants")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  // Get completed challenges and check if user won last 3
  let consecutiveWins = 0;
  // Implementation would check recent challenge results
  // For now, simplified version
  if (consecutiveWins >= 3) {
    await ctx.runMutation(internal.achievements.awardAchievement, {
      userId,
      achievementId: "challenge_streak",
    });
  }
}

// Check expense tracking achievements
export const checkExpenseAchievements = mutation({
  args: {
    userId: v.id("users"),
    expenseAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Get user's total expenses
    const allExpenses = await ctx.db.query("expenses").collect();
    const userExpenses = allExpenses.filter(expense => 
      expense.paidByUserId === args.userId ||
      expense.splits.some(split => split.userId === args.userId)
    );

    let totalTracked = 0;
    userExpenses.forEach(expense => {
      const userSplit = expense.splits.find(split => split.userId === args.userId);
      if (userSplit) {
        totalTracked += userSplit.amount;
      }
    });

    // Check big spender achievement
    if (totalTracked >= 50000) {
      await ctx.runMutation(internal.achievements.awardAchievement, {
        userId: args.userId,
        achievementId: "big_spender",
      });
    }

    // Check consistent tracking (simplified - would need daily tracking)
    await ctx.runMutation(internal.achievements.awardAchievement, {
      userId: args.userId,
      achievementId: "consistent_tracker",
    });
  },
});

// Get achievement leaderboard
export const getAchievementLeaderboard = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const leaderboard = users
      .filter(user => user.gamificationPoints && user.gamificationPoints > 0)
      .map(user => ({
        userId: user._id,
        name: user.name,
        imageUrl: user.imageUrl,
        points: user.gamificationPoints || 0,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50); // Top 50

    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});
