"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Target, Users, Trophy, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export function ChallengeCard({ challenge, onJoin, onView, isParticipating = false }) {
  const progress = (challenge.myParticipation?.currentAmount || 0) / challenge.targetAmount * 100;
  const daysLeft = Math.ceil((challenge.endDate - Date.now()) / (1000 * 60 * 60 * 24));
  
  const getChallengeTypeColor = (type) => {
    switch (type) {
      case "saving": return "bg-green-100 text-green-800";
      case "spending_limit": return "bg-red-100 text-red-800";
      case "category_limit": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getChallengeTypeIcon = (type) => {
    switch (type) {
      case "saving": return "💰";
      case "spending_limit": return "🎯";
      case "category_limit": return "📊";
      default: return "🏆";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getChallengeTypeIcon(challenge.type)}</span>
              <div>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <Badge className={getChallengeTypeColor(challenge.type)}>
                  {challenge.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            {daysLeft > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysLeft}d left
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{challenge.description}</p>

          {/* Target Amount */}
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-500" />
            <span>Target: ₹{challenge.targetAmount.toLocaleString()}</span>
          </div>

          {/* Progress (if participating) */}
          {isParticipating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your Progress</span>
                <span>₹{(challenge.myParticipation?.currentAmount || 0).toLocaleString()}</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {progress.toFixed(1)}% complete
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{challenge.participantCount} participants</span>
            </div>
            
            {/* Show some participant avatars */}
            <div className="flex -space-x-2">
              {challenge.participants?.slice(0, 3).map((participant, index) => (
                <Avatar key={participant.userId || index} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={participant.userImage} />
                  <AvatarFallback className="text-xs">
                    {participant.userName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {challenge.participantCount > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{challenge.participantCount - 3}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(challenge.startDate), "MMM dd")}</span>
            </div>
            <span>-</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(challenge.endDate), "MMM dd")}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {isParticipating ? (
              <Button onClick={() => onView?.(challenge)} className="flex-1" variant="outline">
                View Details
              </Button>
            ) : (
              <>
                <Button onClick={() => onJoin?.(challenge)} className="flex-1">
                  Join Challenge
                </Button>
                <Button onClick={() => onView?.(challenge)} variant="outline" size="sm">
                  View
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
