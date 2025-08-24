import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Create a new challenge
export const createChallenge = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("saving"), v.literal("spending_limit"), v.literal("category_limit")),
    targetAmount: v.number(),
    category: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    isPublic: v.boolean(),
    invitedUsers: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const challengeId = await ctx.db.insert("challenges", {
      ...args,
      createdBy: user._id,
      participants: [user._id],
      status: "active",
      createdAt: Date.now(),
    });

    // Add creator as participant
    await ctx.db.insert("challengeParticipants", {
      challengeId,
      userId: user._id,
      joinedAt: Date.now(),
      currentAmount: 0,
      status: "active",
    });

    // Send invitations if any
    if (args.invitedUsers && args.invitedUsers.length > 0) {
      for (const userId of args.invitedUsers) {
        await ctx.db.insert("challengeInvitations", {
          challengeId,
          fromUserId: user._id,
          toUserId: userId,
          status: "pending",
          createdAt: Date.now(),
        });
      }
    }

    return challengeId;
  },
});

// Join a challenge
export const joinChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // Check if already participating
    const existing = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_challenge_user", (q) => 
        q.eq("challengeId", args.challengeId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      throw new Error("Already participating in this challenge");
    }

    // Add participant
    await ctx.db.insert("challengeParticipants", {
      challengeId: args.challengeId,
      userId: user._id,
      joinedAt: Date.now(),
      currentAmount: 0,
      status: "active",
    });

    // Update challenge participants list
    const challenge = await ctx.db.get(args.challengeId);
    await ctx.db.patch(args.challengeId, {
      participants: [...challenge.participants, user._id],
    });

    return true;
  },
});

// Get user's active challenges
export const getUserChallenges = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const participations = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const challenges = await Promise.all(
      participations.map(async (participation) => {
        const challenge = await ctx.db.get(participation.challengeId);
        const participants = await ctx.db
          .query("challengeParticipants")
          .withIndex("by_challenge", (q) => q.eq("challengeId", challenge._id))
          .collect();

        const participantDetails = await Promise.all(
          participants.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            return {
              ...p,
              userName: user?.name,
              userImage: user?.imageUrl,
            };
          })
        );

        return {
          ...challenge,
          id: challenge._id,
          myParticipation: participation,
          participants: participantDetails,
          participantCount: participants.length,
        };
      })
    );

    return challenges.filter(c => c.status === "active");
  },
});

// Get challenge leaderboard
export const getChallengeLeaderboard = query({
  args: {
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect();

    const leaderboard = await Promise.all(
      participants.map(async (participant) => {
        const user = await ctx.db.get(participant.userId);
        return {
          userId: participant.userId,
          userName: user?.name || "Unknown",
          userImage: user?.imageUrl,
          currentAmount: participant.currentAmount,
          status: participant.status,
          joinedAt: participant.joinedAt,
        };
      })
    );

    // Sort by performance (depends on challenge type)
    const challenge = await ctx.db.get(args.challengeId);
    if (challenge.type === "saving") {
      leaderboard.sort((a, b) => b.currentAmount - a.currentAmount);
    } else {
      // For spending limits, lower is better
      leaderboard.sort((a, b) => a.currentAmount - b.currentAmount);
    }

    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

// Update challenge progress
export const updateChallengeProgress = mutation({
  args: {
    challengeId: v.id("challenges"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const participation = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_challenge_user", (q) => 
        q.eq("challengeId", args.challengeId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      throw new Error("Not participating in this challenge");
    }

    await ctx.db.patch(participation._id, {
      currentAmount: participation.currentAmount + args.amount,
    });

    // Check for achievements
    await ctx.runMutation(internal.achievements.checkChallengeAchievements, {
      userId: user._id,
      challengeId: args.challengeId,
      newAmount: participation.currentAmount + args.amount,
    });

    return true;
  },
});

// Get public challenges to join
export const getPublicChallenges = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const publicChallenges = await ctx.db
      .query("challenges")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const availableChallenges = [];

    for (const challenge of publicChallenges) {
      if (!challenge.isPublic) continue;
      
      // Check if user is already participating
      const isParticipating = challenge.participants.includes(user._id);
      if (isParticipating) continue;

      const creator = await ctx.db.get(challenge.createdBy);
      const participantCount = challenge.participants.length;

      availableChallenges.push({
        ...challenge,
        id: challenge._id,
        creatorName: creator?.name || "Unknown",
        participantCount,
      });
    }

    return availableChallenges;
  },
});

// Get challenge invitations
export const getChallengeInvitations = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const invitations = await ctx.db
      .query("challengeInvitations")
      .withIndex("by_recipient", (q) => 
        q.eq("toUserId", user._id).eq("status", "pending")
      )
      .collect();

    const invitationDetails = await Promise.all(
      invitations.map(async (invitation) => {
        const challenge = await ctx.db.get(invitation.challengeId);
        const fromUser = await ctx.db.get(invitation.fromUserId);
        
        return {
          ...invitation,
          id: invitation._id,
          challenge,
          fromUserName: fromUser?.name || "Unknown",
          fromUserImage: fromUser?.imageUrl,
        };
      })
    );

    return invitationDetails;
  },
});

// Respond to challenge invitation
export const respondToInvitation = mutation({
  args: {
    invitationId: v.id("challengeInvitations"),
    response: v.union(v.literal("accept"), v.literal("decline")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.toUserId !== user._id) {
      throw new Error("Invalid invitation");
    }

    await ctx.db.patch(args.invitationId, {
      status: args.response === "accept" ? "accepted" : "declined",
      respondedAt: Date.now(),
    });

    if (args.response === "accept") {
      await ctx.runMutation(internal.challenges.joinChallenge, {
        challengeId: invitation.challengeId,
      });
    }

    return true;
  },
});
