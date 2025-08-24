"use client";

import { useState } from "react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { EXPENSE_CATEGORIES } from "@/lib/expense-categories";

export function CreateChallengeModal({ children }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const createChallenge = useConvexMutation(api.challenges.createChallenge);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !type || !targetAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(targetAmount) <= 0) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setIsLoading(true);
    
    try {
      await createChallenge.mutate({
        title: title.trim(),
        description: description.trim(),
        type,
        targetAmount: parseFloat(targetAmount),
        category: type === "category_limit" ? category : undefined,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        isPublic,
      });

      toast.success("Challenge created successfully! 🎉");
      
      // Reset form
      setTitle("");
      setDescription("");
      setType("");
      setTargetAmount("");
      setCategory("");
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      setIsPublic(true);
      setOpen(false);
      
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Failed to create challenge. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const challengeTypes = [
    {
      value: "saving",
      label: "Saving Challenge",
      description: "Save a target amount",
      icon: "💰"
    },
    {
      value: "spending_limit",
      label: "Spending Limit",
      description: "Stay under a spending limit",
      icon: "🎯"
    },
    {
      value: "category_limit",
      label: "Category Limit",
      description: "Limit spending in a specific category",
      icon: "📊"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Challenge
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Create New Challenge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Challenge Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Save ₹10,000 in January"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your challenge goals and rules..."
              rows={3}
              required
            />
          </div>

          {/* Challenge Type */}
          <div className="space-y-2">
            <Label>Challenge Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select challenge type" />
              </SelectTrigger>
              <SelectContent>
                {challengeTypes.map((challengeType) => (
                  <SelectItem key={challengeType.value} value={challengeType.value}>
                    <div className="flex items-center gap-2">
                      <span>{challengeType.icon}</span>
                      <div>
                        <div className="font-medium">{challengeType.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {challengeType.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category (only for category_limit) */}
          {type === "category_limit" && (
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="targetAmount">
              Target Amount (₹) *
              {type === "saving" && <span className="text-xs text-muted-foreground ml-1">(amount to save)</span>}
              {type !== "saving" && <span className="text-xs text-muted-foreground ml-1">(spending limit)</span>}
            </Label>
            <Input
              id="targetAmount"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="10000"
              min="1"
              step="1"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date <= startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Public/Private */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Challenge</Label>
              <div className="text-xs text-muted-foreground">
                Allow anyone to join this challenge
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Challenge 🚀"}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
