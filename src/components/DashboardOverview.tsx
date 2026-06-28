import React, { useState } from "react";
import { 
 TrendingUp, 
 TrendingDown, 
 Flame, 
 Send, 
 Sparkles, 
 CheckCircle2, 
 Activity,
 Wallet,
 PiggyBank
} from "lucide-react";
import { motion } from "motion/react";
import { Transaction, Meal, Profile, ParsedItem } from "../types";
import AIPhotoScanner from "./AIPhotoScanner";
import DashboardAchievements from "./DashboardAchievements";

interface DashboardOverviewProps {
 profile: Profile;
 transactions: Transaction[];
 meals: Meal[];
 onAddTransaction: (t: Transaction) => void;
 onAddMeal: (m: Meal) => void;
}

export default function DashboardOverview({
 profile,
 transactions,
 meals,
 onAddTransaction,
 onAddMeal,
}: DashboardOverviewProps) {
 const [consoleInput, setConsoleInput] = useState("");
 const [parsing, setParsing] = useState(false);
 const [consoleResponse, setConsoleResponse] = useState<string | null>(null);

 const now = new Date();
 const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
 const todayStr = now.toISOString().split("T")[0];

 // Filtering for current month
 const monthExpenses = transactions.filter(
 (t) => t.type === "expense" && t.date.startsWith(currentMonthStr)
 );
 const totalSpentMonth = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

 const monthIncome = transactions.filter(
 (t) => t.type === "income" && t.date.startsWith(currentMonthStr)
 );
 const totalIncomeMonth = monthIncome.reduce((sum, t) => sum + t.amount, 0);

 // Today's meals metrics
 const todayMeals = meals.filter((m) => m.date === todayStr);
 const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
 const todayProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);

 // Burn-bar percentage
 const budgetPercentage = Math.min(100, (totalSpentMonth / profile.monthly_budget) * 100);

 // Projection logic
 const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
 const dayOfMonth = now.getDate();
 const projectedSpend = Math.round((totalSpentMonth / Math.max(1, dayOfMonth)) * daysInMonth);

 const handleConsoleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!consoleInput.trim()) return;

 setParsing(true);
 setConsoleResponse(null);

 try {
 const res = await fetch("/api/parse", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ message: consoleInput }),
 });
 const data = await res.json();

 if (data.result) {
 const parsed: ParsedItem = data.result;

 // Process transaction if returned
 if (parsed.transaction) {
 const newTxn: Transaction = {
 id: `txn-${Date.now()}`,
 user_id: profile.id,
 date: todayStr,
 category: parsed.transaction.category as any,
 amount: parsed.transaction.amount,
 note: parsed.transaction.note,
 type: parsed.transaction.type,
 created_at: new Date().toISOString(),
 };
 onAddTransaction(newTxn);
 }

 // Process meal if returned
 if (parsed.meal) {
 const newMeal: Meal = {
 id: `meal-${Date.now()}`,
 user_id: profile.id,
 date: todayStr,
 name: parsed.meal.name,
 calories: parsed.meal.calories,
 protein: parsed.meal.protein,
 carbs: parsed.meal.carbs,
 fat: parsed.meal.fat,
 fiber: parsed.meal.fiber,
 health_score: parsed.meal.health_score,
 meal_type: parsed.meal.meal_type as any,
 created_at: new Date().toISOString(),
 };
 onAddMeal(newMeal);
 }

 setConsoleResponse(parsed.explanation || "Success! Log saved.");
 setConsoleInput("");
 } else {
 setConsoleResponse("⚠️ Could not process that. Try: 'swiggy 450 pizza'");
 }
 } catch (err) {
 console.error(err);
 setConsoleResponse("⚠️ Server error. Please try again.");
 } finally {
 setParsing(false);
 }
 };

 const formatINR = (num: number) => {
 return "₹" + new Intl.NumberFormat("en-IN").format(num);
 };

 const expenseByCat = monthExpenses.reduce((acc: Record<string, number>, t) => {
 acc[t.category] = (acc[t.category] || 0) + t.amount;
 return acc;
 }, {});

 const sortedCatArray = Object.entries(expenseByCat)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 4);

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-8 font-sans w-full max-w-7xl mx-auto"
 >
 <div className="flex items-center justify-between mb-2">
 <div>
 <h1 className="text-3xl font-semibold tracking-tight text-text-main mb-1">Overview</h1>
 <p className="text-text-muted text-sm">Your daily financial and nutritional summary.</p>
 </div>
 </div>
 
 {/* METRIC CARDS ROW */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, staggerChildren: 0.1, delay: 0.1 }}
 className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"
 >
 {/* Card 1: Spent */}
 <motion.div 
 className="glass-panel border border-border-main p-6 rounded-2xl flex flex-col justify-between shadow-sm"
 >
 <div className="flex justify-between items-start mb-4">
 <span className="text-sm font-medium text-text-muted">Total Spent</span>
 <div className="p-2 bg-border-subtle rounded-lg border border-border-main">
 <Wallet size={16} className="text-text-secondary" />
 </div>
 </div>
 <div className="flex items-baseline gap-2 mb-3">
 <span className="text-2xl font-bold text-text-main tracking-tight">
 {formatINR(totalSpentMonth)}
 </span>
 <span className="text-sm text-text-muted font-medium">
 / {formatINR(profile.monthly_budget)}
 </span>
 </div>
 <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
 <div 
 className={`h-full transition-all duration-500 ${
 budgetPercentage > 90 
 ? "bg-rose-500" 
 : budgetPercentage > 75 
 ? "bg-amber-500" 
 : "bg-emerald-500"
 }`} 
 style={{ width: `${budgetPercentage}%` }}
 ></div>
 </div>
 </motion.div>

 {/* Card 2: Projected */}
 <motion.div 
 className="glass-panel border border-border-main p-6 rounded-2xl flex flex-col justify-between shadow-sm"
 >
 <div className="flex justify-between items-start mb-4">
 <span className="text-sm font-medium text-text-muted">Projected Spend</span>
 <div className="p-2 bg-border-subtle rounded-lg border border-border-main">
 <TrendingUp size={16} className="text-text-secondary" />
 </div>
 </div>
 <div className="text-2xl font-bold text-text-main tracking-tight mb-2">
 {formatINR(projectedSpend)}
 </div>
 <p className="text-sm">
 {projectedSpend <= profile.monthly_budget ? (
 <span className="text-emerald-500 font-medium flex items-center gap-1">
 On track
 </span>
 ) : (
 <span className="text-rose-500 font-medium flex items-center gap-1">
 Over budget pace
 </span>
 )}
 </p>
 </motion.div>

 {/* Card 3: Income */}
 <motion.div 
 className="glass-panel border border-border-main p-6 rounded-2xl flex flex-col justify-between shadow-sm"
 >
 <div className="flex justify-between items-start mb-4">
 <span className="text-sm font-medium text-text-muted">Monthly Income</span>
 <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
 <PiggyBank size={16} className="text-emerald-600" />
 </div>
 </div>
 <div className="text-2xl font-bold text-emerald-600 tracking-tight mb-2">
 {formatINR(totalIncomeMonth)}
 </div>
 <p className="text-sm text-text-muted">
 Net Savings: <span className="font-medium text-text-secondary">{formatINR(Math.max(0, totalIncomeMonth - totalSpentMonth))}</span>
 </p>
 </motion.div>

 {/* Card 4: Diet */}
 <motion.div 
 className="glass-panel border border-border-main p-6 rounded-2xl flex items-center justify-between shadow-sm"
 >
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <Flame size={16} className="text-orange-500" />
 <span className="text-sm font-medium text-text-muted">Daily Intake</span>
 </div>
 <div className="text-2xl font-bold text-text-main tracking-tight flex items-baseline gap-1">
 {todayCalories} <span className="text-sm font-medium text-text-muted">/ {profile.calorie_goal}</span>
 </div>
 <div className="text-sm text-text-secondary flex items-center gap-1.5">
 Protein: <span className="text-text-main font-semibold">{todayProtein}g</span>
 </div>
 </div>
 
 <div className="relative w-[72px] h-[72px] flex-shrink-0">
 <svg className="w-full h-full transform -rotate-90">
 <circle cx="36" cy="36" r="30" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
 <circle 
 cx="36" 
 cy="36" 
 r="30" 
 stroke="currentColor" 
 strokeWidth="6" 
 fill="transparent" 
 strokeDasharray="188.5"
 strokeDashoffset={188.5 - (188.5 * Math.min(100, (todayCalories / profile.calorie_goal) * 100)) / 100}
 strokeLinecap="round"
 className="text-orange-500 transition-all duration-500"
 />
 </svg>
 </div>
 </motion.div>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.2 }}
 className="grid grid-cols-1 lg:grid-cols-12 gap-8"
 >
 {/* Quick Log Input (Left) */}
 <div className="lg:col-span-7 space-y-6">
 <div className="glass-panel border border-border-main rounded-2xl p-6 sm:p-8 shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg text-accent">
 <Sparkles size={20} />
 </div>
 <div>
 <h3 className="text-lg font-semibold text-text-main tracking-tight">
 Quick AI Log
 </h3>
 <p className="text-sm text-text-muted">
 Type any expense or meal naturally.
 </p>
 </div>
 </div>

 <form onSubmit={handleConsoleSubmit} className="space-y-4">
 <div className="relative">
 <input
 type="text"
 required
 value={consoleInput}
 onChange={(e) => setConsoleInput(e.target.value)}
 placeholder="e.g. 'spent 450 on pizza lunch' or 'had 2 eggs'"
 disabled={parsing}
 className="w-full bg-border-subtle border border-border-main focus:border-blue-500 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none text-text-main placeholder-slate-400 disabled:opacity-50 transition-colors shadow-sm"
 />
 <button
 type="submit"
 disabled={parsing || !consoleInput.trim()}
 className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-text-muted p-2 rounded-lg transition shadow-sm active:scale-95"
 >
 <Send size={16} />
 </button>
 </div>
 </form>

 {parsing && (
 <div className="mt-4 flex items-center gap-2 text-sm text-accent font-medium">
 <Activity size={16} className="animate-pulse" /> Processing input...
 </div>
 )}

 {consoleResponse && (
 <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
 <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
 <p className="text-sm text-emerald-800">
 {consoleResponse}
 </p>
 </div>
 )}

 <div className="mt-6 pt-6 border-t border-border-subtle">
 <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
 Suggestions
 </p>
 <div className="flex flex-wrap gap-2">
 {[
 "swiggy 380 lunch paneer",
 "ola 220 office auto",
 "breakfast 2 boiled eggs",
 "got salary 85000",
 ].map((chip) => (
 <button
 key={chip}
 type="button"
 onClick={() => setConsoleInput(chip)}
 className="text-sm font-medium glass-panel hover:bg-border-subtle border border-border-main text-text-secondary px-3 py-1.5 rounded-lg transition-colors shadow-sm"
 >
 {chip}
 </button>
 ))}
 </div>
 </div>
 </div>

 <AIPhotoScanner 
 userId={profile.id} 
 onAddTransaction={onAddTransaction} 
 onAddMeal={onAddMeal} 
 />
 </div>

 {/* Recent Activity (Right) */}
 <div className="lg:col-span-5 space-y-6">
 <div className="glass-panel border border-border-main rounded-2xl p-6 sm:p-8 shadow-sm">
 <h3 className="text-lg font-semibold text-text-main mb-6 tracking-tight">
 Recent Transactions
 </h3>

 <div className="space-y-4">
 {transactions.slice(0, 5).map((t) => {
 const dateObj = new Date(t.date);
 const isExpense = t.type === "expense";
 return (
 <div key={t.id} className="flex items-center justify-between group">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold capitalize shadow-sm ${
 isExpense ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
 }`}>
 {t.category.slice(0, 2)}
 </div>
 <div>
 <h4 className="text-sm font-medium text-text-main capitalize">
 {t.note || t.category}
 </h4>
 <p className="text-xs text-text-muted">
 {dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {t.category}
 </p>
 </div>
 </div>

 <div className={`text-sm font-semibold ${
 isExpense ? "text-text-main" : "text-emerald-600"
 }`}>
 {isExpense ? "-" : "+"}{formatINR(t.amount)}
 </div>
 </div>
 );
 })}
 </div>

 <div className="mt-8 pt-6 border-t border-border-subtle">
 <h3 className="text-sm font-semibold text-text-main mb-4 tracking-tight">
 Top Spending Categories
 </h3>
 <div className="space-y-4">
 {sortedCatArray.length > 0 ? (
 sortedCatArray.map(([cat, val]) => {
 const pct = Math.round((val / totalSpentMonth) * 100);
 return (
 <div key={cat} className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="capitalize text-text-secondary font-medium">{cat}</span>
 <span className="font-semibold text-text-main">{formatINR(val)}</span>
 </div>
 <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
 <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
 </div>
 </div>
 );
 })
 ) : (
 <p className="text-sm text-text-muted">No expenses recorded for this month.</p>
 )}
 </div>
 </div>
 </div>
 </div>
 </motion.div>

 <DashboardAchievements 
 profile={profile} 
 transactions={transactions} 
 meals={meals} 
 />
 </motion.div>
 );
}
