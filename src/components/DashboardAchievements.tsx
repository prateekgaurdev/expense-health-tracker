/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
 Flame, 
 ShieldCheck, 
 UtensilsCrossed, 
 Apple, 
 PiggyBank, 
 Send, 
 Lock, 
 Trophy, 
 Sparkles, 
 Award,
 ChevronRight
} from "lucide-react";
import { Transaction, Meal, Profile } from "../types";
import { calculateGamification, Badge } from "../utils/gamification";

interface DashboardAchievementsProps {
 profile: Profile;
 transactions: Transaction[];
 meals: Meal[];
}

// Icon mapping helper to avoid dynamic imports issues
function getBadgeIcon(iconName: string, active: boolean) {
 const size = 20;
 const colorClass = active ? "text-amber-400" : "text-text-secondary";
 
 switch (iconName) {
 case "ShieldCheck":
 return <ShieldCheck size={size} className={colorClass} />;
 case "Flame":
 return <Flame size={size} className={colorClass} />;
 case "UtensilsCrossed":
 return <UtensilsCrossed size={size} className={colorClass} />;
 case "Apple":
 return <Apple size={size} className={colorClass} />;
 case "PiggyBank":
 return <PiggyBank size={size} className={colorClass} />;
 case "Send":
 return <Send size={size} className={colorClass} />;
 default:
 return <Award size={size} className={colorClass} />;
 }
}

export default function DashboardAchievements({
 profile,
 transactions,
 meals,
}: DashboardAchievementsProps) {
 const {
 currentStreak,
 maxStreak,
 badges,
 weeklyActivity,
 } = calculateGamification(transactions, meals, profile);

 const unlockedCount = badges.filter((b) => b.isUnlocked).length;

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 id="fintrack_gamification_panel" className="space-y-6 font-sans">
 
 {/* 1. STREAK SUMMARY PANEL */}
 <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-border-main rounded-3xl p-6 relative overflow-hidden shadow-xl">
 <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
 <div className="absolute left-10 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

 <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
 
 {/* Flame Streaks */}
 <div className="flex items-center gap-5">
 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg relative group">
 <Flame size={32} className={`text-amber-500 animate-pulse ${currentStreak > 0 ? "scale-110" : "opacity-40"}`} />
 {currentStreak > 0 && (
 <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-text-main text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full animate-bounce">
 HOT
 </span>
 )}
 </div>

 <div>
 <div className="flex items-center gap-2">
 <span className="text-3xl font-display font-extrabold text-text-main font-mono leading-none">
 {currentStreak}
 </span>
 <span className="text-sm text-text-secondary font-mono font-semibold">
 Day Log Streak
 </span>
 </div>
 <p className="text-xs text-text-secondary mt-1 max-w-sm">
 {currentStreak > 0 
 ? `Incredible job! Keep logging expenses and nutrition daily to sustain your fire.`
 : `Start your daily streak! Track any transaction or meal to light the flame today.`}
 </p>
 <div className="text-[10px] text-text-secondary font-mono mt-1.5 flex items-center gap-1.5">
 <span>Personal Best: <b>{maxStreak} Days</b></span>
 <span>·</span>
 <span>Unlocked Milestones: <b>{unlockedCount} / {badges.length}</b></span>
 </div>
 </div>
 </div>

 {/* Weekly Timeline Checklist (Mon-Sun) */}
 <div className="glass-panel/60 border border-border-main rounded-2xl p-4 w-full lg:w-auto min-w-[320px]">
 <p className="text-[9px] text-text-secondary uppercase tracking-widest font-mono font-bold mb-3">
 // Weekly Activity Tracker
 </p>
 <div className="grid grid-cols-7 gap-2.5">
 {weeklyActivity.map((day) => {
 const isToday = day.dateStr === new Date().toISOString().split("T")[0];
 return (
 <div key={day.dateStr} className="flex flex-col items-center gap-1">
 <span className={`text-[10px] font-mono font-semibold ${isToday ? "text-emerald-600" : "text-text-secondary"}`}>
 {day.dayName}
 </span>
 <div 
 title={day.dateStr}
 className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
 day.active
 ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/5 font-bold"
 : isToday
 ? "glass-panel border-slate-300 text-text-secondary"
 : "glass-panel border-border-main text-text-secondary"
 }`}
 >
 {day.active ? "✓" : "·"}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 </div>
 </div>

 {/* 2. BADGES GRID */}
 <div>
 <div className="flex items-center gap-2 mb-4">
 <Trophy size={16} className="text-amber-400" />
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
 Milestone Awards Cabinet
 </h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {badges.map((badge) => (
 <div
 key={badge.id}
 className={`border rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden group ${
 badge.isUnlocked
 ? "glass-panel/80 hover:glass-panel border-border-main hover:border-slate-300/80 shadow-md shadow-emerald-500/1"
 : "glass-panel border-border-main text-text-secondary opacity-65"
 }`}
 >
 {/* Unlock glow overlay */}
 {badge.isUnlocked && (
 <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/2 rounded-full blur-xl group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>
 )}

 {/* Badge Icon and Name Header */}
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-3.5">
 <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
 badge.isUnlocked
 ? "glass-panel border-border-main"
 : "glass-panel/20 border-border-main/60"
 }`}>
 {getBadgeIcon(badge.iconName, badge.isUnlocked)}
 </div>
 <div>
 <h4 className={`text-sm font-semibold transition ${
 badge.isUnlocked ? "text-slate-200" : "text-text-secondary"
 }`}>
 {badge.name}
 </h4>
 <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded glass-panel/80 border border-border-main text-text-secondary">
 {badge.category}
 </span>
 </div>
 </div>

 {badge.isUnlocked ? (
 <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
 <Sparkles size={8} /> Unlocked
 </span>
 ) : (
 <Lock size={12} className="text-text-secondary" />
 )}
 </div>

 {/* Description */}
 <p className="text-xs text-text-secondary group-hover:text-text-secondary transition leading-relaxed">
 {badge.description}
 </p>

 {/* Progress Bar */}
 <div className="space-y-1.5 pt-1">
 <div className="w-full glass-panel h-1.5 rounded-full overflow-hidden border border-border-main/40">
 <div
 className={`h-full transition-all duration-500 ${
 badge.isUnlocked ? "bg-emerald-500" : "bg-slate-200"
 }`}
 style={{ width: `${badge.progressPercent}%` }}
 ></div>
 </div>
 <div className="flex justify-between text-[10px] font-mono text-text-secondary">
 <span>Progress</span>
 <span className={badge.isUnlocked ? "text-emerald-500 font-bold" : "text-text-secondary"}>
 {badge.progressText}
 </span>
 </div>
 </div>

 </div>
 ))}
 </div>
 </div>

 </motion.div>
 );
}
