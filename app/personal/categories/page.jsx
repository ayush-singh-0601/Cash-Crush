"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus,
  Edit,
  Trash2,
  Settings,
  DollarSign,
  TrendingUp,
  Palette
} from "lucide-react";
import { toast } from "sonner";

export default function CategoryManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    emoji: "📦",
    color: "#F7DC6F",
    budgetLimit: ""
  });

  const categories = useQuery(api.personalFinance.getExpenseCategories);
  const budget = useQuery(api.personalFinance.getPersonalBudget);
  const addCustomCategory = useMutation(api.personalFinance.addCustomCategory);

  const defaultCategories = [
    { name: "Food & Dining", emoji: "🍕", color: "#FF6B6B", isDefault: true },
    { name: "Transportation", emoji: "🚗", color: "#4ECDC4", isDefault: true },
    { name: "Entertainment", emoji: "🎬", color: "#45B7D1", isDefault: true },
    { name: "Shopping", emoji: "🛍️", color: "#96CEB4", isDefault: true },
    { name: "Bills & Utilities", emoji: "💡", color: "#FFEAA7", isDefault: true },
    { name: "Health & Fitness", emoji: "💊", color: "#DDA0DD", isDefault: true },
    { name: "Education", emoji: "📚", color: "#98D8C8", isDefault: true },
    { name: "Miscellaneous", emoji: "📦", color: "#F7DC6F", isDefault: true },
  ];

  const customCategories = categories?.filter(cat => !cat.isDefault) || [];

  const emojiOptions = [
    "🍕", "🚗", "🎬", "🛍️", "💡", "💊", "📚", "📦",
    "🏠", "✈️", "🎮", "👕", "⚡", "🏥", "🎓", "🔧",
    "💰", "📱", "🍺", "🎵", "🚲", "🏋️", "📝", "🎯"
  ];

  const colorOptions = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#FFB6C1", "#87CEEB", "#98FB98", "#F0E68C"
  ];

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await addCustomCategory({
        name: newCategory.name,
        emoji: newCategory.emoji,
        color: newCategory.color,
        budgetLimit: newCategory.budgetLimit ? parseFloat(newCategory.budgetLimit) : undefined,
      });
      
      toast.success("Category added successfully!");
      setIsAddDialogOpen(false);
      setNewCategory({ name: "", emoji: "📦", color: "#F7DC6F", budgetLimit: "" });
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const getCategoryBudget = (categoryName) => {
    if (!budget) return 0;
    const key = categoryName.toLowerCase().replace(/[^a-z]/g, '');
    return budget.categoryBudgets[key] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600">Organize your expenses with custom categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="e.g., Pet Care, Hobbies"
                />
              </div>
              
              <div>
                <Label>Choose Emoji</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewCategory({...newCategory, emoji})}
                      className={`p-2 text-xl border rounded-lg hover:bg-gray-50 ${
                        newCategory.emoji === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Choose Color</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({...newCategory, color})}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        newCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="budget">Monthly Budget Limit (Optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCategory.budgetLimit}
                  onChange={(e) => setNewCategory({...newCategory, budgetLimit: e.target.value})}
                  placeholder="₹5000"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddCategory} className="flex-1">
                  Add Category
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Default Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Default Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {defaultCategories.map((category) => {
              const budgetAmount = getCategoryBudget(category.name);
              return (
                <div
                  key={category.name}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  style={{ borderColor: category.color }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Monthly Budget:</span>
                      <span className="font-medium">₹{budgetAmount}</span>
                    </div>
                    
                    <div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: category.color,
                          width: '60%' // This would be calculated based on actual spending
                        }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      60% used this month
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Custom Categories
            <Badge variant="outline">{customCategories.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCategories.map((category) => (
                <div
                  key={category._id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  style={{ borderColor: category.color }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget Limit:</span>
                      <span className="font-medium">
                        ₹{category.budgetLimit || "No limit"}
                      </span>
                    </div>
                    
                    {category.budgetLimit && (
                      <>
                        <div 
                          className="h-2 rounded-full"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <div
                            className="h-2 rounded-full"
                            style={{ 
                              backgroundColor: category.color,
                              width: '30%' // This would be calculated based on actual spending
                            }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          30% used this month
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Categories</h3>
              <p className="text-gray-600 mb-4">Create custom categories to better organize your expenses</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Category Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {defaultCategories.length + customCategories.length}
              </div>
              <p className="text-sm text-gray-600">Total Categories</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {customCategories.length}
              </div>
              <p className="text-sm text-gray-600">Custom Categories</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{budget ? Object.values(budget.categoryBudgets).reduce((sum, amount) => sum + amount, 0) : 0}
              </div>
              <p className="text-sm text-gray-600">Total Monthly Budget</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Category Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Create specific categories for better expense tracking</li>
              <li>• Set budget limits to control spending in each category</li>
              <li>• Use emojis to quickly identify categories</li>
              <li>• Review and adjust categories based on your spending patterns</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
