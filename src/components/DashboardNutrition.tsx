import React, { useState } from "react";
import { 
 Flame, 
 Utensils, 
 Sparkles, 
 ShieldCheck, 
 Heart,
 Plus
} from "lucide-react";
import { motion } from "motion/react";
import { Meal, Profile, Transaction } from "../types";

interface DashboardNutritionProps {
 profile: Profile;
 meals: Meal[];
 transactions: Transaction[];
 onAddMeal: (m: Meal) => void;
}

export default function DashboardNutrition({
 profile,
 meals,
 transactions,
 onAddMeal,
}: DashboardNutritionProps) {
 const [showAddForm, setShowAddForm] = useState(false);
 const [mealName, setMealName] = useState("");
 const [calories, setCalories] = useState("");
 const [protein, setProtein] = useState("");
 const [carbs, setCarbs] = useState("");
 const [fat, setFat] = useState("");
 const [fiber, setFiber] = useState("");
 const [score, setScore] = useState("8");
 const [mealType, setMealType] = useState<any>("snack");

 const todayStr = new Date().toISOString().split("T")[0];

 // Filters for today's logs
 const todayMeals = meals.filter((m) => m.date === todayStr);
 const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
 const todayProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);

 // Averages across all recorded meal days
 const uniqueDays = Array.from(new Set(meals.map((m) => m.date)));
 const dayCount = Math.max(1, uniqueDays.length);
 
 const avgCarbs = Math.round(meals.reduce((sum, m) => sum + m.carbs, 0) / dayCount);
 const avgProtein = Math.round(meals.reduce((sum, m) => sum + m.protein, 0) / dayCount);
 const avgFat = Math.round(meals.reduce((sum, m) => sum + m.fat, 0) / dayCount);
 const avgFiber = Math.round(meals.reduce((sum, m) => sum + m.fiber, 0) / dayCount);
 const avgScore = (meals.reduce((sum, m) => sum + m.health_score, 0) / Math.max(1, meals.length)).toFixed(1);

 // Home-cooked vs Delivery ratio
 const deliveryMeals = meals.filter(
 (m) => m.name.toLowerCase().includes("swiggy") || m.name.toLowerCase().includes("zomato")
 );
 const deliveryCount = deliveryMeals.length;
 const homeCookedCount = Math.max(0, meals.length - deliveryCount);
 const homePct = Math.round((homeCookedCount / Math.max(1, meals.length)) * 100);

 // Cost per 100 kcal / 10g protein
 const currentMonthStr = todayStr.substring(0, 7);
 const foodExpenses = transactions.filter(
 (t) => t.category === "food" && t.date.startsWith(currentMonthStr)
 );
 const totalFoodSpent = foodExpenses.reduce((sum, t) => sum + t.amount, 0);
 
 const monthMeals = meals.filter((m) => m.date.startsWith(currentMonthStr));
 const totalCaloriesLogged = monthMeals.reduce((sum, m) => sum + m.calories, 0);
 const totalProteinLogged = monthMeals.reduce((sum, m) => sum + m.protein, 0);

 const costPer100Kcal = totalCaloriesLogged > 0 
 ? ((totalFoodSpent / totalCaloriesLogged) * 100).toFixed(1)
 : "0.0";
 const costPer10gProtein = totalProteinLogged > 0
 ? ((totalFoodSpent / totalProteinLogged) * 10).toFixed(1)
 : "0.0";

 let efficiencyRating = "Excellent";
 let efficiencyDesc = "You cook mostly at home. You logged great nutrition relative to what you spent.";
 if (parseFloat(costPer100Kcal) > 45) {
 efficiencyRating = "Slightly Low";
 efficiencyDesc = "Your food delivery costs (Swiggy/Zomato) are high relative to the nutritional density logged.";
 } else if (parseFloat(costPer100Kcal) > 25) {
 efficiencyRating = "Moderate";
 efficiencyDesc = "Your nutrition is balanced, but cooking one more meal at home per week will improve your savings pace.";
 }

 const handleManualAddMeal = (e: React.FormEvent) => {
 e.preventDefault();
 if (!mealName.trim() || !calories || isNaN(parseInt(calories))) return;

 const newMeal: Meal = {
 id: `meal-manual-${Date.now()}`,
 user_id: profile.id,
 date: todayStr,
 name: mealName.trim(),
 calories: parseInt(calories),
 protein: parseInt(protein) || 0,
 carbs: parseInt(carbs) || 0,
 fat: parseInt(fat) || 0,
 fiber: parseInt(fiber) || 0,
 health_score: parseInt(score) || 7,
 meal_type: mealType,
 created_at: new Date().toISOString(),
 };

 onAddMeal(newMeal);
 setMealName("");
 setCalories("");
 setProtein("");
 setCarbs("");
 setFat("");
 setFiber("");
 setShowAddForm(false);
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-8 font-sans">
 
 {/* HEADER ROW */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
 <div className="space-y-2">
 <h2 className="text-lg font-semibold text-slate-900 ">Nutrition Goals</h2>
 <div className="text-sm text-slate-500">
 Active targets: <b className="text-orange-500">{profile.calorie_goal} kcal</b> / day & <b className="text-emerald-500">{profile.protein_goal}g protein</b> / day
 </div>
 </div>

 <button
 onClick={() => setShowAddForm(!showAddForm)}
 className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200 text-sm flex items-center gap-2"
 >
 <Plus size={16} /> {showAddForm ? "Close Form" : "Log Manual Meal"}
 </button>
 </div>

 {showAddForm && (
 <form onSubmit={handleManualAddMeal} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
 <div className="border-b border-slate-100 pb-4">
 <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
 <Utensils size={16} className="text-blue-500" /> Log Meal Details
 </h4>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
 <div className="md:col-span-3 space-y-2">
 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Meal Name</label>
 <input
 type="text"
 required
 value={mealName}
 onChange={(e) => setMealName(e.target.value)}
 placeholder="Chicken bowl..."
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition"
 />
 </div>
 <div className="md:col-span-2 space-y-2">
 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Type</label>
 <select
 value={mealType}
 onChange={(e) => setMealType(e.target.value as any)}
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition capitalize"
 >
 <option value="breakfast">Breakfast</option>
 <option value="lunch">Lunch</option>
 <option value="dinner">Dinner</option>
 <option value="snack">Snack</option>
 </select>
 </div>
 <div className="md:col-span-1.5 space-y-2">
 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Calories</label>
 <input
 type="number"
 required
 value={calories}
 onChange={(e) => setCalories(e.target.value)}
 placeholder="350"
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition"
 />
 </div>
 <div className="md:col-span-1 space-y-2">
 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Protein (g)</label>
 <input
 type="number"
 value={protein}
 onChange={(e) => setProtein(e.target.value)}
 placeholder="15"
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition"
 />
 </div>
 <div className="md:col-span-1 space-y-2">
 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Carbs (g)</label>
 <input
 type="number"
 value={carbs}
 onChange={(e) => setCarbs(e.target.value)}
 placeholder="40"
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition"
 />
 </div>
 <div className="md:col-span-1 space-y-2">
 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Fat (g)</label>
 <input
 type="number"
 value={fat}
 onChange={(e) => setFat(e.target.value)}
 placeholder="8"
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition"
 />
 </div>
 <div className="md:col-span-1 space-y-2">
 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Fiber (g)</label>
 <input
 type="number"
 value={fiber}
 onChange={(e) => setFiber(e.target.value)}
 placeholder="4"
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition"
 />
 </div>
 <div className="md:col-span-1.5 pt-6">
 <button
 type="submit"
 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm transition"
 >
 Save Log
 </button>
 </div>
 </div>
 </form>
 )}

 {/* RINGS ROW */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Ring 1 */}
 <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center justify-between shadow-sm">
 <div className="space-y-2">
 <p className="text-slate-500 text-sm font-medium">Daily Calories</p>
 <div className="text-2xl font-bold text-slate-900 ">
 {todayCalories} <span className="text-slate-400 text-sm font-medium">/ {profile.calorie_goal} kcal</span>
 </div>
 <p className="text-xs text-slate-500">
 {todayCalories >= profile.calorie_goal ? "Target met!" : `${profile.calorie_goal - todayCalories} kcal remaining`}
 </p>
 </div>
 <div className="relative w-16 h-16">
 <svg className="w-full h-full transform -rotate-90">
 <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-slate-100 " strokeWidth="6" fill="transparent" />
 <circle 
 cx="32" 
 cy="32" 
 r="26" 
 stroke="currentColor" 
 strokeWidth="6" 
 fill="transparent" 
 strokeDasharray="163"
 strokeDashoffset={163 - (163 * Math.min(100, (todayCalories / profile.calorie_goal) * 100)) / 100}
 strokeLinecap="round"
 className="text-orange-500 transition-all duration-500"
 />
 </svg>
 </div>
 </div>

 {/* Ring 2 */}
 <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center justify-between shadow-sm">
 <div className="space-y-2">
 <p className="text-slate-500 text-sm font-medium">Daily Protein</p>
 <div className="text-2xl font-bold text-slate-900 ">
 {todayProtein}g <span className="text-slate-400 text-sm font-medium">/ {profile.protein_goal}g</span>
 </div>
 <p className="text-xs text-slate-500">
 {Math.round((todayProtein / profile.protein_goal) * 100)}% of target met
 </p>
 </div>
 <div className="relative w-16 h-16">
 <svg className="w-full h-full transform -rotate-90">
 <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-slate-100 " strokeWidth="6" fill="transparent" />
 <circle 
 cx="32" 
 cy="32" 
 r="26" 
 stroke="currentColor" 
 strokeWidth="6" 
 fill="transparent" 
 strokeDasharray="163"
 strokeDashoffset={163 - (163 * Math.min(100, (todayProtein / profile.protein_goal) * 100)) / 100}
 strokeLinecap="round"
 className="text-emerald-500 transition-all duration-500"
 />
 </svg>
 </div>
 </div>

 {/* Health Score */}
 <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm flex flex-col justify-between">
 <div>
 <p className="text-slate-500 text-sm font-medium">Avg Health Score</p>
 <div className="text-2xl font-bold text-amber-500 pt-1">
 {avgScore} / 10
 </div>
 </div>
 <p className="text-xs text-slate-500 flex items-center gap-1.5">
 <Heart size={14} className="text-rose-500" /> Keep eating clean!
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Cost Efficiency */}
 <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
 <div className="flex items-center justify-between">
 <h3 className="text-base font-semibold text-slate-900 ">
 Wealth-Wellness Efficiency
 </h3>
 <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
 AI Insight
 </span>
 </div>

 <p className="text-sm text-slate-500">
 By linking your restaurant food orders directly with your calorie and protein logs, we compute how much each unit of nutrition is costing you.
 </p>

 <div className="grid grid-cols-3 gap-4 text-center">
 <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
 <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Food per 100 kcal</p>
 <p className="text-xl font-bold text-slate-900 pt-2">₹{costPer100Kcal}</p>
 </div>
 <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
 <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Food per 10g Protein</p>
 <p className="text-xl font-bold text-emerald-600 pt-2">₹{costPer10gProtein}</p>
 </div>
 <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center">
 <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Rating</p>
 <p className="text-base font-bold text-amber-500 pt-2">{efficiencyRating}</p>
 </div>
 </div>

 <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
 <Sparkles size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
 <div className="space-y-1">
 <p className="text-sm font-semibold text-slate-900 ">Recommendation</p>
 <p className="text-sm text-slate-600 leading-relaxed">{efficiencyDesc}</p>
 </div>
 </div>
 </div>

 {/* Cooking vs ordering */}
 <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-sm">
 <div>
 <h3 className="text-base font-semibold text-slate-900 mb-3">
 Cooking vs Ordering
 </h3>
 <p className="text-sm text-slate-500 leading-relaxed">
 Based on keyword tags, home cooked meals give you a much higher average health score vs food delivery apps.
 </p>
 </div>

 <div className="space-y-3 pt-4">
 <div className="flex justify-between text-sm font-medium">
 <span className="text-emerald-600 ">Home-cooked ({homePct}%)</span>
 <span className="text-blue-600 ">Ordering ({100 - homePct}%)</span>
 </div>
 <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
 <div className="bg-emerald-500 h-full" style={{ width: `${homePct}%` }}></div>
 <div className="bg-blue-500 h-full" style={{ width: `${100 - homePct}%` }}></div>
 </div>
 <p className="text-xs text-slate-500 text-center">
 Target: Maintain {`>`}75% home-cooked ratio
 </p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* Macros Breakdown */}
 <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
 <h3 className="text-base font-semibold text-slate-900 ">
 Daily Averages
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 ">
 <span className="text-slate-500 text-xs font-medium uppercase tracking-wide block mb-1">Carbs</span>
 <span className="text-2xl font-bold text-slate-900 ">{avgCarbs}g</span>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 ">
 <span className="text-slate-500 text-xs font-medium uppercase tracking-wide block mb-1">Protein</span>
 <span className="text-2xl font-bold text-emerald-600 ">{avgProtein}g</span>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 ">
 <span className="text-slate-500 text-xs font-medium uppercase tracking-wide block mb-1">Fats</span>
 <span className="text-2xl font-bold text-blue-600 ">{avgFat}g</span>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 ">
 <span className="text-slate-500 text-xs font-medium uppercase tracking-wide block mb-1">Fiber</span>
 <span className="text-2xl font-bold text-slate-900 ">{avgFiber}g</span>
 </div>
 </div>
 </div>

 {/* Audited Meals list */}
 <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
 <h3 className="text-base font-semibold text-slate-900 ">
 Diet Logs ({meals.length} meals)
 </h3>

 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
 {meals.length > 0 ? (
 meals.slice(0, 15).map((m) => (
 <div 
 key={m.id} 
 className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition"
 >
 <div className="space-y-1.5 flex-1">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-slate-900 capitalize text-sm">{m.name}</span>
 <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 ">
 {m.meal_type}
 </span>
 </div>
 <p className="text-xs text-slate-500">
 {m.date} · Protein: <span className="font-semibold text-slate-700 ">{m.protein}g</span> · Carbs: {m.carbs}g
 </p>
 </div>
 <div className="text-right space-y-1">
 <span className="font-bold text-blue-600 text-base block">
 {m.calories} kcal
 </span>
 <span className="text-xs font-medium text-slate-500">
 Health: <span className={m.health_score >= 8 ? "text-emerald-500" : m.health_score >= 5 ? "text-amber-500" : "text-rose-500"}>{m.health_score}/10</span>
 </span>
 </div>
 </div>
 ))
 ) : (
 <p className="text-sm text-slate-500 text-center py-12">
 No food meals logged yet.
 </p>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 );
}
