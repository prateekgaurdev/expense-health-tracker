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
 { name: 'Food & Dining', spent: 4200, cap: 10000, color: 'bg-blue-500' },
 { name: 'Shopping', spent: 6500, cap: 5000, color: 'bg-red-500' },
 { name: 'Travel', spent: 2800, cap: 4000, color: 'bg-emerald-500' },
 ];

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="w-full text-slate-900 font-sans max-w-7xl mx-auto">
 
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">Money Ledger</h1>
 <p className="text-slate-500 text-sm">Track your income, expenses, and category budgets.</p>
 </div>
 <button 
 onClick={() => setShowAddForm(!showAddForm)}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
 >
 <Plus size={16} /> New Transaction
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 
 <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-medium text-slate-500">
 Total Income
 </span>
 <div className="p-2 bg-emerald-50 rounded-lg">
 <TrendingUp size={20} className="text-emerald-600" />
 </div>
 </div>
 <div className="flex items-baseline gap-2">
 <div className="text-3xl font-semibold text-slate-900 tracking-tight">
 ₹1,45,000
 </div>
 </div>
 </div>

 <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-medium text-slate-500">
 Total Expense
 </span>
 <div className="p-2 bg-red-50 rounded-lg">
 <TrendingDown size={20} className="text-red-600" />
 </div>
 </div>
 <div className="flex items-baseline gap-2">
 <div className="text-3xl font-semibold text-slate-900 tracking-tight">
 ₹42,350
 </div>
 </div>
 </div>

 <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-medium text-slate-500">
 Net Savings
 </span>
 <div className="p-2 bg-blue-50 rounded-lg">
 <Briefcase size={20} className="text-blue-600" />
 </div>
 </div>
 <div className="flex items-baseline gap-2">
 <div className="text-3xl font-semibold text-slate-900 tracking-tight">
 ₹1,02,650
 </div>
 <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+70.7%</span>
 </div>
 </div>

 </div>

 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
 
 <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
 <button 
 onClick={() => setTimeFilter("current")}
 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "current" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
 >
 Current Month
 </button>
 <button 
 onClick={() => setTimeFilter("3months")}
 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "3months" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
 >
 Last 3 Months
 </button>
 <button 
 onClick={() => setTimeFilter("custom")}
 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "custom" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
 >
 Custom
 </button>
 </div>

 <div className="flex items-center gap-3">
 <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
 <Filter size={16} className="text-slate-400" /> Filter
 </button>
 <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
 <Download size={16} className="text-slate-400" /> Export
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
 
 <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
 <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
 <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
 View All
 </button>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr>
 <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-white">Date</th>
 <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-white">Category</th>
 <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-white">Description</th>
 <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-white text-right">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {mockTransactions.map((txn) => (
 <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
 {txn.date}
 </td>
 <td className="py-4 px-6 text-sm text-slate-900">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
 <txn.icon size={16} />
 </div>
 <span className="font-medium">{txn.category}</span>
 </div>
 </td>
 <td className="py-4 px-6 text-sm text-slate-600">
 {txn.desc}
 </td>
 <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
 {txn.type === 'income' ? (
 <span className="text-emerald-600 font-semibold">{formatINR(txn.amount)}</span>
 ) : (
 <span className="text-slate-900 font-medium">-{formatINR(txn.amount)}</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="lg:col-span-4 flex flex-col gap-6">
 
 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
 <h3 className="text-base font-semibold text-slate-900 mb-6">
 Category Budgets
 </h3>
 
 <div className="space-y-6">
 {burnRates.map((burn, idx) => {
 const percentage = Math.min(100, Math.round((burn.spent / burn.cap) * 100));
 const isOver = burn.spent > burn.cap;
 return (
 <div key={idx} className="space-y-2">
 <div className="flex justify-between items-end mb-1">
 <span className="text-sm font-medium text-slate-700">{burn.name}</span>
 <div className="flex items-baseline gap-1">
 <span className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-slate-900'}`}>₹{new Intl.NumberFormat('en-IN').format(burn.spent)}</span>
 <span className="text-xs text-slate-400">/ ₹{burn.cap / 1000}k</span>
 </div>
 </div>
 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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

 <div className="bg-white rounded-2xl border border-slate-200 p-6 flex-1 flex flex-col items-center justify-center shadow-sm">
 <h3 className="text-base font-semibold text-slate-900 mb-6 self-start w-full">
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
 <span className="text-2xl font-bold text-slate-900">76%</span>
 <span className="text-xs font-medium text-slate-500">Saved</span>
 </div>
 </div>

 <div className="flex items-center justify-center gap-6 w-full">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
 <span className="text-sm font-medium text-slate-600">Income</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-slate-200"></div>
 <span className="text-sm font-medium text-slate-600">Expense</span>
 </div>
 </div>
 </div>

 </div>

 </div>

 </div>
 </motion.div>
 );
}

