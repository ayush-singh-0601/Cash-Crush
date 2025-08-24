"use client";

import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";

export function ChallengeLeaderboard({ challengeId }) {
  const { data: leaderboard, isLoading } = useConvexQuery(
    api.challenges.getChallengeLeaderboard,
    challengeId ? { challengeId } : "skip"
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No participants yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-400" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200";
      default:
        return "bg-white border-gray-100";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((participant, index) => (
            <motion.div
              key={participant.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${getRankColor(participant.rank)}`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">
                {getRankIcon(participant.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={participant.userImage} />
                <AvatarFallback>
                  {participant.userName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {participant.userName}
                  </span>
                  {participant.rank <= 3 && (
                    <Badge variant="secondary" className="text-xs">
                      {participant.rank === 1 ? "🥇" : participant.rank === 2 ? "🥈" : "🥉"}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  ₹{participant.currentAmount.toLocaleString()}
                </div>
              </div>

              {/* Status */}
              <div className="text-right">
                <Badge 
                  variant={participant.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {participant.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="h-16 w-16 bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-lg flex items-end justify-center">
                  <span className="text-white font-bold mb-2">2</span>
                </div>
                <Avatar className="h-8 w-8 mx-auto -mt-4 border-2 border-white">
                  <AvatarImage src={leaderboard[1]?.userImage} />
                  <AvatarFallback className="text-xs">
                    {leaderboard[1]?.userName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs mt-1 font-medium">
                  {leaderboard[1]?.userName}
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="h-20 w-16 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-lg flex items-end justify-center relative">
                  <Crown className="absolute -top-3 h-6 w-6 text-yellow-500" />
                  <span className="text-white font-bold mb-2">1</span>
                </div>
                <Avatar className="h-10 w-10 mx-auto -mt-5 border-2 border-white">
                  <AvatarImage src={leaderboard[0]?.userImage} />
                  <AvatarFallback className="text-xs">
                    {leaderboard[0]?.userName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs mt-1 font-medium">
                  {leaderboard[0]?.userName}
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="h-12 w-16 bg-gradient-to-b from-orange-200 to-orange-300 rounded-t-lg flex items-end justify-center">
                  <span className="text-white font-bold mb-2">3</span>
                </div>
                <Avatar className="h-8 w-8 mx-auto -mt-4 border-2 border-white">
                  <AvatarImage src={leaderboard[2]?.userImage} />
                  <AvatarFallback className="text-xs">
                    {leaderboard[2]?.userName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs mt-1 font-medium">
                  {leaderboard[2]?.userName}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
