import React, { useState } from "react";
import { motion } from "motion/react";
import { 
 TrendingUp, 
 TrendingDown, 
 Download,
 Plus,
 Briefcase,
 Utensils,
 Car,
 ShoppingBag,
 Zap,
 ChevronDown,
 Filter
} from "lucide-react";
import { Transaction, Profile } from "../types";

interface DashboardMoneyProps {
 profile: Profile;
 transactions: Transaction[];
 onAddTransaction: (t: Transaction) => void;
}

export default function DashboardMoney({
 profile,
 transactions,
 onAddTransaction,
}: DashboardMoneyProps) {
 const [showAddForm, setShowAddForm] = useState(false);
 const [timeFilter, setTimeFilter] = useState("current");

 const formatINR = (num: number) => {
 return "₹" + new Intl.NumberFormat("en-IN").format(num);
 };

 const mockTransactions = [
 { id: '1', date: '01 Jun', category: 'Income', icon: Briefcase, desc: 'Salary Credited', amount: 145000, type: 'income' },
 { id: '2', date: '02 Jun', category: 'Food', icon: Utensils, desc: 'Swiggy 420 Dinner', amount: 420, type: 'expense' },
 { id: '3', date: '05 Jun', category: 'Travel', icon: Car, desc: 'Ola to Office', amount: 350, type: 'expense' },
 { id: '4', date: '08 Jun', category: 'Shopping', icon: ShoppingBag, desc: '1.5k Myntra Shirt', amount: 1500, type: 'expense' },
 { id: '5', date: '10 Jun', category: 'Utilities', icon: Zap, desc: 'Bescom Electricity Bill', amount: 1280, type: 'expense' },
 ];

 const burnRates = [
 { name: 'Food & Dining', spent: 4200, cap: 10000, color: 'bg-accent/100' },
 { name: 'Shopping', spent: 6500, cap: 5000, color: 'bg-red-500' },
 { name: 'Travel', spent: 2800, cap: 4000, color: 'bg-emerald-500' },
 ];

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="w-full text-text-main font-sans max-w-7xl mx-auto">
 
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl font-semibold tracking-tight text-text-main mb-1">Money Ledger</h1>
 <p className="text-text-muted text-sm">Track your income, expenses, and category budgets.</p>
 </div>
 <button 
 onClick={() => setShowAddForm(!showAddForm)}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
 >
 <Plus size={16} /> New Transaction
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 
 <div className="glass-panel rounded-2xl border border-border-main p-6 flex flex-col justify-between shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-medium text-text-muted">
 Total Income
 </span>
 <div className="p-2 bg-emerald-50 rounded-lg">
 <TrendingUp size={20} className="text-emerald-600" />
 </div>
 </div>
 <div className="flex items-baseline gap-2">
 <div className="text-3xl font-semibold text-text-main tracking-tight">
 ₹1,45,000
 </div>
 </div>
 </div>

 <div className="glass-panel rounded-2xl border border-border-main p-6 flex flex-col justify-between shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-medium text-text-muted">
 Total Expense
 </span>
 <div className="p-2 bg-red-50 rounded-lg">
 <TrendingDown size={20} className="text-red-600" />
 </div>
 </div>
 <div className="flex items-baseline gap-2">
 <div className="text-3xl font-semibold text-text-main tracking-tight">
 ₹42,350
 </div>
 </div>
 </div>

 <div className="glass-panel rounded-2xl border border-border-main p-6 flex flex-col justify-between shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-medium text-text-muted">
 Net Savings
 </span>
 <div className="p-2 bg-accent/10 rounded-lg">
 <Briefcase size={20} className="text-accent" />
 </div>
 </div>
 <div className="flex items-baseline gap-2">
 <div className="text-3xl font-semibold text-text-main tracking-tight">
 ₹1,02,650
 </div>
 <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+70.7%</span>
 </div>
 </div>

 </div>

 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
 
 <div className="flex items-center bg-border-subtle p-1 rounded-lg border border-border-main">
 <button 
 onClick={() => setTimeFilter("current")}
 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "current" ? "glass-panel text-text-main shadow-sm" : "text-text-secondary hover:text-text-main"}`}
 >
 Current Month
 </button>
 <button 
 onClick={() => setTimeFilter("3months")}
 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "3months" ? "glass-panel text-text-main shadow-sm" : "text-text-secondary hover:text-text-main"}`}
 >
 Last 3 Months
 </button>
 <button 
 onClick={() => setTimeFilter("custom")}
 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "custom" ? "glass-panel text-text-main shadow-sm" : "text-text-secondary hover:text-text-main"}`}
 >
 Custom
 </button>
 </div>

 <div className="flex items-center gap-3">
 <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary glass-panel border border-border-main rounded-lg hover:bg-border-subtle transition-colors shadow-sm">
 <Filter size={16} className="text-text-muted" /> Filter
 </button>
 <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary glass-panel border border-border-main rounded-lg hover:bg-border-subtle transition-colors shadow-sm">
 <Download size={16} className="text-text-muted" /> Export
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 <div className="lg:col-span-8 glass-panel rounded-2xl border border-border-main shadow-sm overflow-hidden">
 
 <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-border-subtle/50">
 <h2 className="text-lg font-semibold text-text-main">Recent Transactions</h2>
 <button className="text-sm font-medium text-accent hover:text-blue-700 transition">
 View All
 </button>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr>
 <th className="py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border-main glass-panel">Date</th>
 <th className="py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border-main glass-panel">Category</th>
 <th className="py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border-main glass-panel">Description</th>
 <th className="py-3 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border-main glass-panel text-right">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {mockTransactions.map((txn) => (
 <tr key={txn.id} className="hover:bg-border-subtle/50 transition-colors">
 <td className="py-4 px-6 text-sm text-text-muted whitespace-nowrap">
 {txn.date}
 </td>
 <td className="py-4 px-6 text-sm text-text-main">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-border-subtle rounded-lg text-text-secondary">
 <txn.icon size={16} />
 </div>
 <span className="font-medium">{txn.category}</span>
 </div>
 </td>
 <td className="py-4 px-6 text-sm text-text-secondary">
 {txn.desc}
 </td>
 <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
 {txn.type === 'income' ? (
 <span className="text-emerald-600 font-semibold">{formatINR(txn.amount)}</span>
 ) : (
 <span className="text-text-main font-medium">-{formatINR(txn.amount)}</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="lg:col-span-4 flex flex-col gap-6">
 
 <div className="glass-panel rounded-2xl border border-border-main p-6 shadow-sm">
 <h3 className="text-base font-semibold text-text-main mb-6">
 Category Budgets
 </h3>
 
 <div className="space-y-6">
 {burnRates.map((burn, idx) => {
 const percentage = Math.min(100, Math.round((burn.spent / burn.cap) * 100));
 const isOver = burn.spent > burn.cap;
 return (
 <div key={idx} className="space-y-2">
 <div className="flex justify-between items-end mb-1">
 <span className="text-sm font-medium text-text-secondary">{burn.name}</span>
 <div className="flex items-baseline gap-1">
 <span className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-text-main'}`}>₹{new Intl.NumberFormat('en-IN').format(burn.spent)}</span>
 <span className="text-xs text-text-muted">/ ₹{burn.cap / 1000}k</span>
 </div>
 </div>
 <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
 <div 
 className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : burn.color}`}
 style={{ width: `${percentage}%` }}
 ></div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="glass-panel rounded-2xl border border-border-main p-6 flex-1 flex flex-col items-center justify-center shadow-sm">
 <h3 className="text-base font-semibold text-text-main mb-6 self-start w-full">
 Cashflow Overview
 </h3>
 
 <div className="flex-1 flex flex-col items-center justify-center py-2 w-full">
 <div className="relative w-40 h-40 mb-6">
 <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
 <circle 
 cx="50" cy="50" r="40" 
 fill="transparent" 
 stroke="#e2e8f0" 
 strokeWidth="12" 
 />
 <circle 
 cx="50" cy="50" r="40" 
 fill="transparent" 
 stroke="#10b981" 
 strokeWidth="12" 
 strokeDasharray="251.2"
 strokeDashoffset="60"
 className="transition-all duration-1000 ease-out"
 strokeLinecap="round"
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-2xl font-bold text-text-main">76%</span>
 <span className="text-xs font-medium text-text-muted">Saved</span>
 </div>
 </div>

 <div className="flex items-center justify-center gap-6 w-full">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
 <span className="text-sm font-medium text-text-secondary">Income</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-slate-200"></div>
 <span className="text-sm font-medium text-text-secondary">Expense</span>
 </div>
 </div>
 </div>

 </div>

 </div>

 </div>
 </motion.div>
 );
}

