"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lock, Star } from "lucide-react";

export function AchievementBadge({ achievement, size = "md", showPoints = true }) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20", 
    lg: "h-24 w-24"
  };

  const iconSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl"
  };

  return (
    <motion.div
      whileHover={{ scale: achievement.earned ? 1.05 : 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`${achievement.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} relative overflow-hidden`}>
        <CardContent className="p-4 text-center">
          {/* Achievement Icon */}
          <div className={`${sizeClasses[size]} mx-auto mb-2 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-gradient-to-br from-yellow-100 to-orange-100' : 'bg-gray-100'}`}>
            {achievement.earned ? (
              <span className={iconSizes[size]}>{achievement.icon}</span>
            ) : (
              <Lock className="h-6 w-6 text-gray-400" />
            )}
          </div>

          {/* Achievement Title */}
          <h3 className={`font-semibold text-sm mb-1 ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
            {achievement.title}
          </h3>

          {/* Achievement Description */}
          <p className={`text-xs mb-2 ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>

          {/* Points Badge */}
          {showPoints && (
            <Badge 
              variant={achievement.earned ? "default" : "secondary"}
              className="text-xs"
            >
              <Star className="h-3 w-3 mr-1" />
              {achievement.points} pts
            </Badge>
          )}

          {/* Earned Date */}
          {achievement.earned && achievement.awardedAt && (
            <div className="text-xs text-muted-foreground mt-1">
              Earned {new Date(achievement.awardedAt).toLocaleDateString()}
            </div>
          )}

          {/* Sparkle Effect for Earned Achievements */}
          {achievement.earned && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute top-2 right-2"
            >
              <span className="text-yellow-400">✨</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
