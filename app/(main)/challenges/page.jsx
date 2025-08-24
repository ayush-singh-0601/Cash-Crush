"use client";

import { useState } from "react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Users, Target, Calendar, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { CreateChallengeModal } from "@/components/challenges/create-challenge-modal";
import { ChallengeLeaderboard } from "@/components/challenges/challenge-leaderboard";
import { AchievementBadge } from "@/components/achievements/achievement-badge";
import ConfettiEffect from "@/components/confetti-effect";

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState("my-challenges");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: myChallenges, isLoading: challengesLoading } = useConvexQuery(
    api.challenges.getUserChallenges
  );
  const { data: publicChallenges, isLoading: publicLoading } = useConvexQuery(
    api.challenges.getPublicChallenges
  );
  const { data: achievements, isLoading: achievementsLoading } = useConvexQuery(
    api.achievements.getUserAchievements
  );
  const { data: leaderboard, isLoading: leaderboardLoading } = useConvexQuery(
    api.achievements.getAchievementLeaderboard
  );

  const joinChallenge = useConvexMutation(api.challenges.joinChallenge);

  const handleJoinChallenge = async (challenge) => {
    try {
      await joinChallenge({ challengeId: challenge.id });
      toast.success(`Joined "${challenge.title}" successfully! 🎉`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Failed to join challenge. Please try again.");
    }
  };

  const handleViewChallenge = (challenge) => {
    setSelectedChallenge(challenge);
  };

  if (challengesLoading || publicLoading || achievementsLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showConfetti && <ConfettiEffect />}
      
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-title flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Challenges & Achievements
            </h1>
            <p className="text-muted-foreground mt-2">
              Compete with friends and achieve your financial goals
            </p>
          </div>
          
          <CreateChallengeModal>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </CreateChallengeModal>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{myChallenges?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Active Challenges</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{achievements?.earnedCount || 0}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{achievements?.totalPoints || 0}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{publicChallenges?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Available Challenges</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* My Challenges Tab */}
          <TabsContent value="my-challenges" className="space-y-6">
            {myChallenges && myChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ChallengeCard
                      challenge={challenge}
                      onView={handleViewChallenge}
                      isParticipating={true}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first challenge or join one from the discover tab!
                  </p>
                  <CreateChallengeModal>
                    <Button>Create Your First Challenge</Button>
                  </CreateChallengeModal>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {publicChallenges && publicChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ChallengeCard
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      onView={handleViewChallenge}
                      isParticipating={false}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No Public Challenges</h3>
                  <p className="text-muted-foreground">
                    Be the first to create a public challenge for others to join!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {achievements?.achievements?.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AchievementBadge achievement={achievement} />
                </motion.div>
              ))}
            </div>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {achievements?.earnedCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Achievements Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {achievements?.totalPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {achievements?.totalCount - (achievements?.earnedCount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Global Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Global Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboard && leaderboard.length > 0 ? (
                    <div className="space-y-3">
                      {leaderboard.slice(0, 10).map((user, index) => (
                        <motion.div
                          key={user.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <div className="w-8 text-center font-bold text-muted-foreground">
                            #{user.rank}
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {user.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{user.name}</div>
                          </div>
                          <Badge variant="secondary">
                            {user.points} pts
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No rankings yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Challenge Leaderboard */}
              {selectedChallenge && (
                <ChallengeLeaderboard challengeId={selectedChallenge.id} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
