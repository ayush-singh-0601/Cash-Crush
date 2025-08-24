"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Camera,
  MapPin,
  Clock,
  DollarSign,
  Tag,
  Smile,
  CreditCard,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddPersonalExpense() {
  const router = useRouter();
  const [expense, setExpense] = useState({
    amount: "",
    category: "",
    subcategory: "",
    description: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    isRecurring: false,
    recurringFrequency: "monthly",
    tags: [],
    location: "",
    paymentMethod: "",
    mood: "",
    notes: ""
  });
  const [newTag, setNewTag] = useState("");
  const [budgetWarning, setBudgetWarning] = useState(null);
  
  // Voice Recognition Setup
  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        parseVoiceCommand(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition failed. Please try again.");
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast.error("Voice recognition not supported in this browser");
    }
  };
  
  const parseVoiceCommand = (transcript) => {
    const text = transcript.toLowerCase();
    
    // Extract amount (₹150, 150 rupees, etc.)
    const amountMatch = text.match(/(₹?\s*)(\d+)\s*(rupees?)?/);
    if (amountMatch) {
      const amount = amountMatch[2];
      setExpense(prev => ({ ...prev, amount }));
    }
    
    // Extract category keywords
    if (text.includes('lunch') || text.includes('food') || text.includes('eat')) {
      setExpense(prev => ({ ...prev, category: 'Food & Dining' }));
    } else if (text.includes('transport') || text.includes('bus') || text.includes('taxi')) {
      setExpense(prev => ({ ...prev, category: 'Transportation' }));
    } else if (text.includes('coffee') || text.includes('tea')) {
      setExpense(prev => ({ ...prev, category: 'Food & Dining' }));
    }
    
    // Use the transcript as description
    setExpense(prev => ({ ...prev, description: transcript }));
    
    toast.success(`Voice command processed: "${transcript}"`);
  };
  
  const applyTemplate = (template) => {
    setExpense({
      ...expense,
      amount: template.amount.toString(),
      category: template.category,
      description: template.description
    });
    toast.success(`Applied template: ${template.name}`);
  };

  const categories = useQuery(api.personalFinance.getExpenseCategories);
  const budget = useQuery(api.personalFinance.getPersonalBudget);
  const dailyStatus = useQuery(api.personalFinance.getDailyBudgetStatus);
  
  const addExpense = useMutation(api.personalFinance.addPersonalExpense);

  const categoryEmojis = {
    "Food & Dining": "🍕",
    "Transportation": "🚗",
    "Entertainment": "🎬",
    "Shopping": "🛍️",
    "Bills & Utilities": "💡",
    "Health & Fitness": "💊",
    "Education": "📚",
    "Miscellaneous": "📦"
  };

  const moodOptions = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "stressed", emoji: "😰", label: "Stressed" },
    { value: "excited", emoji: "🤩", label: "Excited" },
    { value: "sad", emoji: "😢", label: "Sad" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "card", label: "Card", icon: "💳" },
    { value: "upi", label: "UPI", icon: "📱" },
    { value: "other", label: "Other", icon: "🔄" }
  ];

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];
  const commonTags = ["food", "transport", "shopping", "bills", "entertainment", "health"];
  
  // Expense Templates for different user types
  const expenseTemplates = {
    "Office Worker": [
      { name: "Office Lunch", amount: 150, category: "Food & Dining", description: "Office cafeteria lunch" },
      { name: "Coffee Break", amount: 80, category: "Food & Dining", description: "Coffee with colleagues" },
      { name: "Bus Fare", amount: 30, category: "Transportation", description: "Daily commute" },
      { name: "Parking Fee", amount: 50, category: "Transportation", description: "Office parking" },
      { name: "Team Dinner", amount: 500, category: "Food & Dining", description: "Team outing dinner" }
    ],
    "Student": [
      { name: "Canteen Meal", amount: 80, category: "Food & Dining", description: "College canteen food" },
      { name: "Photocopy", amount: 20, category: "Education", description: "Notes and assignments" },
      { name: "Bus Pass", amount: 200, category: "Transportation", description: "Monthly bus pass" },
      { name: "Stationery", amount: 100, category: "Education", description: "Pens, notebooks, etc" },
      { name: "Group Study Snacks", amount: 150, category: "Food & Dining", description: "Snacks for study group" }
    ],
    "General": [
      { name: "Grocery Shopping", amount: 800, category: "Shopping", description: "Weekly groceries" },
      { name: "Phone Recharge", amount: 200, category: "Bills & Utilities", description: "Monthly mobile recharge" },
      { name: "Movie Ticket", amount: 250, category: "Entertainment", description: "Cinema hall movie" },
      { name: "Fuel", amount: 500, category: "Transportation", description: "Petrol/diesel" },
      { name: "Medicine", amount: 150, category: "Health & Fitness", description: "Pharmacy purchase" }
    ]
  };
  
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState("General");
  const [isListening, setIsListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  
  // Get recent expenses for smart suggestions
  const recentExpenses = useQuery(api.personalFinance.getRecentExpenses, { limit: 10 });
  
  // Smart suggestions based on recent activity
  const getSmartSuggestions = () => {
    if (!recentExpenses) return { categories: [], amounts: [] };
    
    const categoryCount = {};
    const amountFrequency = {};
    
    recentExpenses.forEach(expense => {
      categoryCount[expense.category] = (categoryCount[expense.category] || 0) + 1;
      const roundedAmount = Math.round(expense.amount / 50) * 50; // Round to nearest 50
      amountFrequency[roundedAmount] = (amountFrequency[roundedAmount] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
      
    const topAmounts = Object.entries(amountFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([amount]) => parseInt(amount))
      .filter(amount => amount > 0);
    
    return { categories: topCategories, amounts: topAmounts };
  };
  
  const smartSuggestions = getSmartSuggestions();

  const checkBudgetImpact = (amount, category) => {
    if (!budget || !dailyStatus || !amount) return;

    const expenseAmount = parseFloat(amount);
    const newDailyTotal = (dailyStatus.totalSpent || 0) + expenseAmount;
    const dailyLimit = dailyStatus.dailyLimit || budget.dailyBudget;

    if (newDailyTotal > dailyLimit) {
      setBudgetWarning({
        type: "daily",
        message: `This expense will put you ₹${Math.round(newDailyTotal - dailyLimit)} over your daily budget`,
        severity: "high"
      });
    } else if (newDailyTotal > dailyLimit * 0.8) {
      setBudgetWarning({
        type: "daily",
        message: `This will use ${Math.round((newDailyTotal / dailyLimit) * 100)}% of your daily budget`,
        severity: "medium"
      });
    } else {
      setBudgetWarning(null);
    }
  };

  const handleAmountChange = (value) => {
    setExpense({...expense, amount: value});
    checkBudgetImpact(value, expense.category);
  };

  const addTag = () => {
    if (newTag.trim() && !expense.tags.includes(newTag.trim())) {
      setExpense({
        ...expense,
        tags: [...expense.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setExpense({
      ...expense,
      tags: expense.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!expense.amount || !expense.category || !expense.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const expenseDate = new Date(`${expense.date}T${expense.time}`);
      
      await addExpense({
        amount: parseFloat(expense.amount),
        category: expense.category,
        subcategory: expense.subcategory || undefined,
        description: expense.description,
        date: expenseDate.getTime(),
        isRecurring: expense.isRecurring,
        recurringFrequency: expense.isRecurring ? expense.recurringFrequency : undefined,
        tags: expense.tags.length > 0 ? expense.tags : undefined,
        location: expense.location || undefined,
        paymentMethod: expense.paymentMethod || undefined,
        mood: expense.mood || undefined,
        notes: expense.notes || undefined
      });

      toast.success("Expense added successfully!");
      router.push("/personal/dashboard");
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Add Personal Expense</h1>
        <p className="text-gray-600">Track your spending and stay within budget</p>
      </div>

      {/* Expense Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Category Selector */}
          <div>
            <Label>Template Category</Label>
            <div className="flex gap-2 mt-2">
              {Object.keys(expenseTemplates).map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedTemplateCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTemplateCategory(category)}
                >
                  {category === "Office Worker" ? "👔" : category === "Student" ? "🎓" : "👤"} {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Template Buttons */}
          <div>
            <Label>Quick Expense Templates</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {expenseTemplates[selectedTemplateCategory].map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="justify-start text-left h-auto py-2"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-gray-500">₹{template.amount} • {template.category}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount & Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Basic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <div className="space-y-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={expense.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="₹0.00"
                  className="text-lg"
                  required
                />
                
                {/* Smart Amount Suggestions */}
                {smartSuggestions.amounts.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Your usual amounts:</p>
                    <div className="flex flex-wrap gap-2">
                      {smartSuggestions.amounts.map((amount) => (
                        <Button
                          key={`smart-${amount}`}
                          type="button"
                          variant={expense.amount === amount.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAmountChange(amount.toString())}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quick amounts:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountChange(amount.toString())}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Warning */}
            {budgetWarning && (
              <div className={`p-3 rounded-lg border ${
                budgetWarning.severity === "high" 
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Budget Alert</span>
                </div>
                <p className="text-sm mt-1">{budgetWarning.message}</p>
              </div>
            )}

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              
              {/* Recent Categories Quick Select */}
              {smartSuggestions.categories.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Recent categories:</p>
                  <div className="flex gap-2">
                    {smartSuggestions.categories.map((categoryName) => {
                      const categoryData = categories?.find(c => c.name === categoryName);
                      return categoryData ? (
                        <Button
                          key={categoryName}
                          type="button"
                          variant={expense.category === categoryName ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExpense({...expense, category: categoryName})}
                        >
                          <span className="mr-1">{categoryData.emoji}</span>
                          {categoryName}
                        </Button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              <Select value={expense.category} onValueChange={(value) => setExpense({...expense, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="description"
                    value={expense.description}
                    onChange={(e) => setExpense({...expense, description: e.target.value})}
                    placeholder="What did you spend on?"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    className="px-3"
                  >
                    {isListening ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">Listening...</span>
                      </div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">💡 Try saying: "Add 150 rupees lunch expense" or click the mic button</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              When
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expense.date}
                  onChange={(e) => setExpense({...expense, date: e.target.value})}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={expense.time}
                  onChange={(e) => setExpense({...expense, time: e.target.value})}
                />
              </div>
            </div>

            {/* Quick Time Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setExpense({
                    ...expense,
                    date: format(now, 'yyyy-MM-dd'),
                    time: format(now, 'HH:mm')
                  });
                }}
              >
                <Clock className="w-4 h-4 mr-1" />
                Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.value}
                    type="button"
                    variant={expense.paymentMethod === method.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExpense({...expense, paymentMethod: method.value})}
                    className="justify-start"
                  >
                    <span className="mr-2">{method.icon}</span>
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  value={expense.location}
                  onChange={(e) => setExpense({...expense, location: e.target.value})}
                  placeholder="Where did you spend?"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mood */}
            <div>
              <Label>How are you feeling about this expense?</Label>
              <div className="flex gap-2 mt-2">
                {moodOptions.map((mood) => (
                  <Button
                    key={mood.value}
                    type="button"
                    variant={expense.mood === mood.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExpense({...expense, mood: mood.value})}
                  >
                    <span className="mr-1">{mood.emoji}</span>
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Common Tags */}
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!expense.tags.includes(tag)) {
                          setExpense({...expense, tags: [...expense.tags, tag]});
                        }
                      }}
                      disabled={expense.tags.includes(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                
                {/* Selected Tags */}
                {expense.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {expense.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={expense.notes}
                onChange={(e) => setExpense({...expense, notes: e.target.value})}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recurring Expense */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Recurring Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={expense.isRecurring}
                onChange={(e) => setExpense({...expense, isRecurring: e.target.checked})}
              />
              <Label htmlFor="recurring">This is a recurring expense</Label>
            </div>
            
            {expense.isRecurring && (
              <div>
                <Label>Frequency</Label>
                <Select value={expense.recurringFrequency} onValueChange={(value) => setExpense({...expense, recurringFrequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Daily Budget Status */}
      {dailyStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Today's Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span>Spent: ₹{dailyStatus.totalSpent}</span>
              <span>Remaining: ₹{Math.max(0, dailyStatus.remaining)}</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    dailyStatus.percentageUsed > 100 ? 'bg-red-500' :
                    dailyStatus.percentageUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(dailyStatus.percentageUsed, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
