/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Meal, Profile } from "./types";

export const mockProfile: Profile = {
  id: "demo-user",
  email: "demo@fintrack.ai",
  name: "Gummy Bear",
  telegram_chat_id: "777888999",
  link_code: "FT-9402",
  monthly_budget: 35000,
  calorie_goal: 2200,
  protein_goal: 110,
  created_at: new Date().toISOString(),
};

// Generates logs over the past 6 months to display beautiful charts and patterns
const categories = [
  "travel", "food", "groceries", "clothes", "rent", "bills", 
  "luxuries", "investments", "health", "education", "other"
] as const;

export function generateMockData(): { transactions: Transaction[]; meals: Meal[] } {
  const transactions: Transaction[] = [];
  const meals: Meal[] = [];

  const now = new Date();
  
  // Create historical logs for the last 6 months
  for (let m = 0; m < 6; m++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 15);
    const yyyymm = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
    
    // Monthly income
    transactions.push({
      id: `inc-salary-${m}`,
      user_id: "demo-user",
      date: `${yyyymm}-01`,
      category: "other",
      amount: 85000,
      note: "Salary Credited",
      type: "income",
      created_at: new Date(`${yyyymm}-01T10:00:00Z`).toISOString(),
    });

    transactions.push({
      id: `inc-cashback-${m}`,
      user_id: "demo-user",
      date: `${yyyymm}-18`,
      category: "other",
      amount: 1200,
      note: "Credit Card Cashback Reward",
      type: "income",
      created_at: new Date(`${yyyymm}-18T15:30:00Z`).toISOString(),
    });

    // Fixed expenses
    transactions.push({
      id: `exp-rent-${m}`,
      user_id: "demo-user",
      date: `${yyyymm}-03`,
      category: "rent",
      amount: 15000,
      note: "House Rent payment",
      type: "expense",
      created_at: new Date(`${yyyymm}-03T11:00:00Z`).toISOString(),
    });

    transactions.push({
      id: `exp-bills-${m}`,
      user_id: "demo-user",
      date: `${yyyymm}-05`,
      category: "bills",
      amount: 2800,
      note: "Wifi & Electricity Utility Bills",
      type: "expense",
      created_at: new Date(`${yyyymm}-05T09:15:00Z`).toISOString(),
    });

    transactions.push({
      id: `exp-netflix-${m}`,
      user_id: "demo-user",
      date: `${yyyymm}-07`,
      category: "bills",
      amount: 649,
      note: "Netflix Premium Subscription",
      type: "expense",
      created_at: new Date(`${yyyymm}-07T08:00:00Z`).toISOString(),
    });

    transactions.push({
      id: `exp-sip-${m}`,
      user_id: "demo-user",
      date: `${yyyymm}-10`,
      category: "investments",
      amount: 5000,
      note: "Nifty 50 Index Fund SIP",
      type: "expense",
      created_at: new Date(`${yyyymm}-10T11:30:00Z`).toISOString(),
    });

    // Variable expenses (travel, food, groceries, health, fun)
    // Travel (approx 5 trips per month)
    const travelLocs = ["Ola Cab to Office", "Uber Auto to Metro", "Metro smart card recharge", "Petrol pump refill"];
    for (let i = 0; i < 5; i++) {
      const day = String(4 + i * 5).padStart(2, "0");
      const amt = 180 + (i * 70);
      transactions.push({
        id: `exp-travel-${m}-${i}`,
        user_id: "demo-user",
        date: `${yyyymm}-${day}`,
        category: "travel",
        amount: amt,
        note: travelLocs[i % travelLocs.length],
        type: "expense",
        created_at: new Date(`${yyyymm}-${day}T09:00:00Z`).toISOString(),
      });
    }

    // Food & Dining (approx 8 orders/meals per month)
    const foodNotes = [
      { note: "Swiggy Dinner Paneer Tikka", amt: 420, kcal: 680, prot: 24, carbs: 45, fat: 38, fib: 4, score: 6, type: "dinner" as const },
      { note: "Zomato Pizza Treat", amt: 580, kcal: 980, prot: 28, carbs: 120, fat: 42, fib: 2, score: 3, type: "dinner" as const },
      { note: "Chai Point Snacks", amt: 120, kcal: 220, prot: 4, carbs: 30, fat: 8, fib: 1, score: 4, type: "snack" as const },
      { note: "Burger King combo", amt: 320, kcal: 850, prot: 20, carbs: 95, fat: 34, fib: 3, score: 3, type: "lunch" as const },
      { note: "Subway Roast Chicken Sub", amt: 280, kcal: 450, prot: 26, carbs: 48, fat: 12, fib: 5, score: 8, type: "lunch" as const },
      { note: "Starbucks Iced Latte + Croissant", amt: 450, kcal: 480, prot: 10, carbs: 55, fat: 22, fib: 2, score: 4, type: "breakfast" as const },
      { note: "Biryani Blues", amt: 380, kcal: 820, prot: 32, carbs: 90, fat: 28, fib: 4, score: 5, type: "dinner" as const },
    ];

    for (let i = 0; i < foodNotes.length; i++) {
      const day = String(2 + i * 4).padStart(2, "0");
      const foodItem = foodNotes[i];
      
      transactions.push({
        id: `exp-food-${m}-${i}`,
        user_id: "demo-user",
        date: `${yyyymm}-${day}`,
        category: "food",
        amount: foodItem.amt,
        note: foodItem.note,
        type: "expense",
        created_at: new Date(`${yyyymm}-${day}T20:00:00Z`).toISOString(),
      });

      // Corresponding nutrition entry
      meals.push({
        id: `meal-food-${m}-${i}`,
        user_id: "demo-user",
        date: `${yyyymm}-${day}`,
        name: foodItem.note,
        calories: foodItem.kcal,
        protein: foodItem.prot,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        fiber: foodItem.fib,
        health_score: foodItem.score,
        meal_type: foodItem.type,
        created_at: new Date(`${yyyymm}-${day}T20:05:00Z`).toISOString(),
      });
    }

    // Groceries (Blinkit / Zepto) (approx 4 times per month)
    const groceryItems = ["Blinkit milk, bread and eggs", "Zepto weekly fruits & veggies", "Blinkit protein bars & oats", "Supermarket household restocking"];
    for (let i = 0; i < 4; i++) {
      const day = String(6 + i * 7).padStart(2, "0");
      transactions.push({
        id: `exp-groc-${m}-${i}`,
        user_id: "demo-user",
        date: `${yyyymm}-${day}`,
        category: "groceries",
        amount: 600 + (i * 250),
        note: groceryItems[i],
        type: "expense",
        created_at: new Date(`${yyyymm}-${day}T10:00:00Z`).toISOString(),
      });
    }

    // Health (approx once every 2 months)
    if (m % 2 === 0) {
      transactions.push({
        id: `exp-health-${m}`,
        user_id: "demo-user",
        date: `${yyyymm}-22`,
        category: "health",
        amount: 1500,
        note: "Consultation + Pharmacy Medicines",
        type: "expense",
        created_at: new Date(`${yyyymm}-22T14:00:00Z`).toISOString(),
      });
    }

    // Clothes (approx once every 3 months)
    if (m % 3 === 0) {
      transactions.push({
        id: `exp-clothes-${m}`,
        user_id: "demo-user",
        date: `${yyyymm}-26`,
        category: "clothes",
        amount: 3200,
        note: "Myntra Winter Wear Jacket",
        type: "expense",
        created_at: new Date(`${yyyymm}-26T17:00:00Z`).toISOString(),
      });
    }

    // Home-cooked healthy meals (logged via bot directly, not costing Swiggy/Zomato)
    // Daily tracking simulation
    const homeMeals = [
      { name: "Oats with protein scoop and banana", kcal: 450, prot: 32, carbs: 60, fat: 8, fib: 8, score: 9, type: "breakfast" as const },
      { name: "Sautéed chicken breast, rice and broccoli", kcal: 520, prot: 45, carbs: 50, fat: 10, fib: 6, score: 10, type: "lunch" as const },
      { name: "Whey shake and raw walnuts", kcal: 260, prot: 26, carbs: 12, fat: 14, fib: 2, score: 9, type: "snack" as const },
      { name: "Dal, paneer bhurji and 2 wheat rotis", kcal: 580, prot: 35, carbs: 65, fat: 18, fib: 9, score: 9, type: "dinner" as const },
      { name: "Egg white omelette with whole wheat toast", kcal: 380, prot: 28, carbs: 32, fat: 9, fib: 4, score: 10, type: "breakfast" as const },
    ];

    for (let dayNum = 1; dayNum <= 28; dayNum++) {
      const day = String(dayNum).padStart(2, "0");
      // Pick 2 home meals per day to simulate tracking consistency
      const mealA = homeMeals[(dayNum) % homeMeals.length];
      const mealB = homeMeals[(dayNum + 2) % homeMeals.length];

      meals.push({
        id: `meal-home-a-${m}-${dayNum}`,
        user_id: "demo-user",
        date: `${yyyymm}-${day}`,
        name: mealA.name,
        calories: mealA.kcal,
        protein: mealA.prot,
        carbs: mealA.carbs,
        fat: mealA.fat,
        fiber: mealA.fib,
        health_score: mealA.score,
        meal_type: mealA.type,
        created_at: new Date(`${yyyymm}-${day}T08:30:00Z`).toISOString(),
      });

      meals.push({
        id: `meal-home-b-${m}-${dayNum}`,
        user_id: "demo-user",
        date: `${yyyymm}-${day}`,
        name: mealB.name,
        calories: mealB.kcal,
        protein: mealB.prot,
        carbs: mealB.carbs,
        fat: mealB.fat,
        fiber: mealB.fib,
        health_score: mealB.score,
        meal_type: mealB.type,
        created_at: new Date(`${yyyymm}-${day}T14:30:00Z`).toISOString(),
      });
    }
  }

  return { transactions, meals };
}
