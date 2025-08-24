"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingDown, TrendingUp, AlertTriangle, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FUNNY_MESSAGES = {
  low_remaining: [
    "🍕 Time to eat instant noodles for the rest of the month!",
    "💸 Your wallet is on a diet now!",
    "🎯 You're playing expense roulette and losing!",
    "🚨 Emergency: Switch to water and dreams for dinner!",
    "💰 Your money is playing hide and seek... and winning!",
  ],
  medium_remaining: [
    "⚠️ Your budget is giving you the side-eye!",
    "🎪 Welcome to the 'Spend Wisely' circus!",
    "🎲 Rolling the dice with your remaining budget!",
    "🎯 Time to channel your inner financial ninja!",
    "💡 Pro tip: Air is still free to breathe!",
  ],
  high_remaining: [
    "🎉 You're a budget rockstar! Keep it up!",
    "✨ Your future self is sending you thank you notes!",
    "🏆 Budget champion in the making!",
    "💪 Financial discipline level: Expert!",
    "🌟 Your wallet is doing a happy dance!",
  ],
  over_budget: [
    "🚨 MAYDAY! Your budget has left the building!",
    "💥 You've entered the danger zone of spending!",
    "🔥 Your budget is currently on fire... literally!",
    "⚰️ RIP Budget 2024 - You will be missed!",
    "🎭 Plot twist: You're now living in a financial thriller!",
    "🌪️ Hurricane spending has hit your account!",
  ],
  debt_reminder: [
    "👻 Your debts are haunting your dreams!",
    "🕰️ Time is money, and you owe both!",
    "🎪 Welcome to the debt circus - you're the main act!",
    "💌 Love letters from your creditors are piling up!",
    "🎯 Your debt-to-income ratio needs therapy!",
  ],
  festival_warning: [
    "🎆 Festival season = Budget demolition season!",
    "🎊 Your money is about to party harder than you!",
    "🎁 Gifts for others, debt for yourself - fair trade?",
    "🎉 Festival vibes: High. Budget remaining: Low.",
    "🪔 May your diyas burn brighter than your budget!",
  ]
};

const BUDGET_EMOJIS = ["💰", "💸", "🎯", "📊", "💳", "🏦", "💵", "🪙"];

export function FunnyBudgetPopup({ 
  isVisible, 
  onClose, 
  budgetData, 
  expenseAmount,
  triggerType = "expense_added" 
}) {
  const [currentEmoji, setCurrentEmoji] = useState("💰");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const interval = setInterval(() => {
        setCurrentEmoji(BUDGET_EMOJIS[Math.floor(Math.random() * BUDGET_EMOJIS.length)]);
      }, 500);

      const timeout = setTimeout(() => {
        setIsAnimating(false);
        clearInterval(interval);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible]);

  const getBudgetStatus = () => {
    if (!budgetData) return "medium_remaining";
    
    const { monthlyRemaining, monthlyProgress } = budgetData;
    
    if (monthlyProgress >= 100) return "over_budget";
    if (monthlyRemaining < 1000) return "low_remaining";
    if (monthlyProgress >= 80) return "medium_remaining";
    return "high_remaining";
  };

  const getMessage = () => {
    const status = getBudgetStatus();
    const messages = FUNNY_MESSAGES[status];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getStatusColor = () => {
    const status = getBudgetStatus();
    switch (status) {
      case "over_budget": return "bg-red-500";
      case "low_remaining": return "bg-orange-500";
      case "medium_remaining": return "bg-yellow-500";
      case "high_remaining": return "bg-green-500";
      default: return "bg-blue-500";
    }
  };

  const getIcon = () => {
    const status = getBudgetStatus();
    switch (status) {
      case "over_budget": return <AlertTriangle className="h-6 w-6" />;
      case "low_remaining": return <TrendingDown className="h-6 w-6" />;
      case "medium_remaining": return <Target className="h-6 w-6" />;
      case "high_remaining": return <TrendingUp className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const formatRemaining = () => {
    if (!budgetData?.monthlyRemaining) return "Budget not set";
    
    const remaining = budgetData.monthlyRemaining;
    if (remaining < 0) {
      return `₹${Math.abs(remaining).toLocaleString()} over budget!`;
    }
    return `₹${remaining.toLocaleString()} left this month`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className={`border-2 shadow-2xl ${getStatusColor()} border-white`}>
            <CardContent className="p-0">
              {/* Header */}
              <div className={`${getStatusColor()} text-white p-4 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
                      className="text-2xl"
                    >
                      {currentEmoji}
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg">Budget Alert!</h3>
                      <p className="text-sm opacity-90">
                        Added ₹{expenseAmount?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white p-4 space-y-4">
                {/* Funny Message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    {getMessage()}
                  </p>
                </motion.div>

                {/* Budget Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getIcon()}
                      <span className="font-medium">Remaining Budget</span>
                    </div>
                    <span className="font-bold text-lg">
                      {formatRemaining()}
                    </span>
                  </div>

                  {budgetData?.monthlyProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Progress</span>
                        <span>{budgetData.monthlyProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(budgetData.monthlyProgress, 100)}%` }}
                          transition={{ delay: 0.6, duration: 1 }}
                          className={`h-2 rounded-full ${
                            budgetData.monthlyProgress >= 100 
                              ? "bg-red-500" 
                              : budgetData.monthlyProgress >= 80 
                                ? "bg-yellow-500" 
                                : "bg-green-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Got it!
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Navigate to budget dashboard
                      window.location.href = '/budget';
                    }}
                    className="flex-1"
                  >
                    View Budget
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Floating particles effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50]
                }}
                transition={{ 
                  duration: 2, 
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="absolute top-4 left-4 text-2xl"
              >
                {BUDGET_EMOJIS[i % BUDGET_EMOJIS.length]}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
