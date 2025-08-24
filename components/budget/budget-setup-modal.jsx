"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { getAllCategories } from "@/lib/expense-categories";

export function BudgetSetupModal({ children, existingBudget = null }) {
  const [open, setOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(existingBudget?.monthlyBudget || "");
  const [weeklyBudget, setWeeklyBudget] = useState(existingBudget?.weeklyBudget || "");
  const [categoryBudgets, setCategoryBudgets] = useState(existingBudget?.categories || []);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: setBudget } = useConvexMutation(api.budgets.setBudget);

  const addCategoryBudget = () => {
    setCategoryBudgets([...categoryBudgets, { categoryId: "", monthlyLimit: "" }]);
  };

  const removeCategoryBudget = (index) => {
    setCategoryBudgets(categoryBudgets.filter((_, i) => i !== index));
  };

  const updateCategoryBudget = (index, field, value) => {
    const updated = [...categoryBudgets];
    updated[index] = { ...updated[index], [field]: value };
    setCategoryBudgets(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!monthlyBudget && !weeklyBudget && categoryBudgets.length === 0) {
      toast.error("Please set at least one budget limit");
      return;
    }

    setIsLoading(true);
    
    try {
      const validCategoryBudgets = categoryBudgets
        .filter(cb => cb.categoryId && cb.monthlyLimit)
        .map(cb => ({
          categoryId: cb.categoryId,
          monthlyLimit: parseFloat(cb.monthlyLimit),
        }));

      await setBudget({
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
        weeklyBudget: weeklyBudget ? parseFloat(weeklyBudget) : undefined,
        categories: validCategoryBudgets.length > 0 ? validCategoryBudgets : undefined,
      });

      toast.success("Budget settings saved successfully! 💰");
      setOpen(false);
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Failed to save budget settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {existingBudget ? "Update Budget" : "Set Your Budget"}
          </DialogTitle>
          <DialogDescription>
            Set monthly and weekly spending limits to track your expenses better
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Monthly Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="monthlyBudget" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Budget (₹)
            </Label>
            <Input
              id="monthlyBudget"
              type="number"
              placeholder="e.g., 25000"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Total amount you want to spend per month
            </p>
          </motion.div>

          {/* Weekly Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="weeklyBudget" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Weekly Budget (₹)
            </Label>
            <Input
              id="weeklyBudget"
              type="number"
              placeholder="e.g., 6000"
              value={weeklyBudget}
              onChange={(e) => setWeeklyBudget(e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Weekly spending limit for better control
            </p>
          </motion.div>

          {/* Category Budgets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Category Limits</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCategoryBudget}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            <div className="space-y-3">
              {categoryBudgets.map((categoryBudget, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-2 items-end p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <Label className="text-sm">Category</Label>
                    <Select
                      value={categoryBudget.categoryId}
                      onValueChange={(value) => updateCategoryBudget(index, "categoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllCategories().map((category) => {
                          const Icon = category.icon;
                          return (
                            <SelectItem key={category.id} value={category.id}>
                              <span className="flex items-center gap-2">
                                {Icon ? <Icon className="h-4 w-4" /> : null}
                                {category.name}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Label className="text-sm">Monthly Limit (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      value={categoryBudget.monthlyLimit}
                      onChange={(e) => updateCategoryBudget(index, "monthlyLimit", e.target.value)}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCategoryBudget(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>

            {categoryBudgets.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No category limits set</p>
                <p className="text-xs">Add category-specific budgets for better tracking</p>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 pt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : existingBudget ? "Update Budget" : "Set Budget"}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
