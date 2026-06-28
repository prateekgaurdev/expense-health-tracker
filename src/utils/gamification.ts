/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Meal, Profile } from "../types";

export function getLocalYYYYMMDD(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface GamificationStats {
  currentStreak: number;
  maxStreak: number;
  unlockedBadgeIds: string[];
  badges: Badge[];
  weeklyActivity: { dayName: string; dateStr: string; active: boolean }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: "finance" | "nutrition" | "general";
  isUnlocked: boolean;
  progressText: string;
  progressPercent: number;
}

export function calculateGamification(
  transactions: Transaction[],
  meals: Meal[],
  profile: Profile | null
): GamificationStats {
  // Combine all active dates
  const loggedDates = new Set<string>();
  transactions.forEach((t) => {
    if (t.date) loggedDates.add(t.date.split("T")[0]);
  });
  meals.forEach((m) => {
    if (m.date) loggedDates.add(m.date.split("T")[0]);
  });

  const todayStr = getLocalYYYYMMDD(new Date());
  
  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = new Date();
  
  // Try starting from today
  if (loggedDates.has(todayStr)) {
    while (true) {
      const dStr = getLocalYYYYMMDD(checkDate);
      if (loggedDates.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // Try starting from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = getLocalYYYYMMDD(checkDate);
    if (loggedDates.has(yesterdayStr)) {
      while (true) {
        const dStr = getLocalYYYYMMDD(checkDate);
        if (loggedDates.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  // 2. Calculate Max Streak (All-time)
  let maxStreak = 0;
  if (loggedDates.size > 0) {
    const sortedDates = Array.from(loggedDates).sort();
    let currentCount = 0;
    let prevTime: number | null = null;

    for (const dStr of sortedDates) {
      // Parse dates explicitly in UTC or clear format to avoid timezone shifts
      const parts = dStr.split("-").map(Number);
      const curTime = Date.UTC(parts[0], parts[1] - 1, parts[2]);

      if (prevTime === null) {
        currentCount = 1;
      } else {
        const diffDays = Math.round((curTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentCount++;
        } else if (diffDays > 1) {
          if (currentCount > maxStreak) maxStreak = currentCount;
          currentCount = 1;
        }
      }
      prevTime = curTime;
    }
    if (currentCount > maxStreak) maxStreak = currentCount;
  }

  // Fallback to current if max is smaller
  if (currentStreak > maxStreak) maxStreak = currentStreak;

  // 3. Weekly activity status (Mon-Sun of the current week)
  const weeklyActivity = [];
  const currentDay = new Date();
  const dayIndex = currentDay.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = dayIndex === 0 ? 6 : dayIndex - 1; // days since Monday
  
  const monday = new Date(currentDay);
  monday.setDate(currentDay.getDate() - distanceToMonday);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dateStr = getLocalYYYYMMDD(dayDate);
    weeklyActivity.push({
      dayName: dayNames[i],
      dateStr,
      active: loggedDates.has(dateStr),
    });
  }

  // 4. Evaluate Badges
  const badges: Badge[] = [];
  const monthlyBudget = profile?.monthly_budget || 35000;
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Badge 1: Budget Master (Under budget for current month, with at least 1 expense)
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date && t.date.startsWith(currentMonthStr)
  );
  const totalSpentMonth = currentMonthExpenses.reduce((s, t) => s + t.amount, 0);
  const isBudgetMaster = currentMonthExpenses.length > 0 && totalSpentMonth <= monthlyBudget;
  badges.push({
    id: "budget_master",
    name: "Budget Master",
    description: "Keep your total monthly expenses below your budget ceiling.",
    iconName: "ShieldCheck",
    category: "finance",
    isUnlocked: isBudgetMaster,
    progressText: isBudgetMaster 
      ? "Goal achieved!" 
      : `${Math.round((totalSpentMonth / monthlyBudget) * 100)}% budget consumed`,
    progressPercent: Math.min(100, (totalSpentMonth / monthlyBudget) * 100)
  });

  // Badge 2: Save Streak (Streak of 5+ days logging)
  const isSaveStreak = currentStreak >= 5;
  badges.push({
    id: "save_streak",
    name: "Save Streak",
    description: "Maintain a logging streak of 5 or more consecutive days.",
    iconName: "Flame",
    category: "general",
    isUnlocked: isSaveStreak,
    progressText: `${currentStreak} / 5 consecutive days`,
    progressPercent: Math.min(100, (currentStreak / 5) * 100)
  });

  // Badge 3: Protein Powerhouse (Any day with protein intake >= daily goal)
  const proteinGoal = profile?.protein_goal || 110;
  const proteinByDay: Record<string, number> = {};
  meals.forEach((m) => {
    proteinByDay[m.date] = (proteinByDay[m.date] || 0) + (m.protein || 0);
  });
  const maxDailyProtein = Object.values(proteinByDay).reduce((max, val) => Math.max(max, val), 0);
  const isProteinPowerhouse = maxDailyProtein >= proteinGoal;
  badges.push({
    id: "protein_powerhouse",
    name: "Protein Powerhouse",
    description: "Reach or exceed your daily protein targets in a single day.",
    iconName: "UtensilsCrossed",
    category: "nutrition",
    isUnlocked: isProteinPowerhouse,
    progressText: isProteinPowerhouse 
      ? `Goal achieved! Max logged: ${maxDailyProtein}g` 
      : `Max daily: ${maxDailyProtein}g / Goal: ${proteinGoal}g`,
    progressPercent: Math.min(100, (maxDailyProtein / proteinGoal) * 100)
  });

  // Badge 4: Mindful Eater (Average health score of meals >= 8.0, minimum 3 meals)
  const minMeals = 3;
  const validMeals = meals.filter(m => m.health_score !== undefined);
  const avgHealth = validMeals.length > 0
    ? validMeals.reduce((s, m) => s + Number(m.health_score), 0) / validMeals.length
    : 0;
  const isMindfulEater = validMeals.length >= minMeals && avgHealth >= 8.0;
  badges.push({
    id: "mindful_eater",
    name: "Mindful Eater",
    description: `Track at least ${minMeals} meals with an average health score of 8.0 or more.`,
    iconName: "Apple",
    category: "nutrition",
    isUnlocked: isMindfulEater,
    progressText: validMeals.length < minMeals
      ? `${validMeals.length} / ${minMeals} meals tracked`
      : `Avg Health: ${avgHealth.toFixed(1)} / 10`,
    progressPercent: validMeals.length < minMeals
      ? (validMeals.length / minMeals) * 100
      : Math.min(100, (avgHealth / 8.0) * 100)
  });

  // Badge 5: Frugal Master (Spend < 50% of monthly budget, with at least 5 expenses)
  const minExpenses = 5;
  const isFrugalMaster = currentMonthExpenses.length >= minExpenses && totalSpentMonth < (monthlyBudget * 0.5);
  badges.push({
    id: "frugal_master",
    name: "Frugal Master",
    description: `Record at least ${minExpenses} transactions and stay under 50% of your budget.`,
    iconName: "PiggyBank",
    category: "finance",
    isUnlocked: isFrugalMaster,
    progressText: currentMonthExpenses.length < minExpenses
      ? `${currentMonthExpenses.length} / ${minExpenses} expenses logged`
      : `Spent ${Math.round((totalSpentMonth / monthlyBudget) * 100)}% of budget`,
    progressPercent: currentMonthExpenses.length < minExpenses
      ? (currentMonthExpenses.length / minExpenses) * 100
      : Math.min(100, (totalSpentMonth / (monthlyBudget * 0.5)) * 100)
  });

  // Badge 6: Telegram Pioneer (Telegram account connected)
  const isTelegramLinked = !!(profile?.telegram_chat_id);
  badges.push({
    id: "telegram_pioneer",
    name: "Bot Pioneer",
    description: "Pair your account with the FinTrack Telegram Bot.",
    iconName: "Send",
    category: "general",
    isUnlocked: isTelegramLinked,
    progressText: isTelegramLinked ? "Connected & Active" : "Unconnected",
    progressPercent: isTelegramLinked ? 100 : 0
  });

  const unlockedBadgeIds = badges.filter((b) => b.isUnlocked).map((b) => b.id);

  return {
    currentStreak,
    maxStreak,
    unlockedBadgeIds,
    badges,
    weeklyActivity,
  };
}
