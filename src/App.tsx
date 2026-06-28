/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
 Bot, 
 User, 
 Coins, 
 Utensils, 
 Link as LinkIcon, 
 MessageSquare, 
 LogOut, 
 ChevronRight,
 Flame,
 LayoutDashboard,
 Sparkles
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { Profile, Transaction, Meal } from "./types";
import { mockProfile, generateMockData } from "./mockData";

// Import Modular Components
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import DashboardOverview from "./components/DashboardOverview";
import DashboardMoney from "./components/DashboardMoney";
import DashboardNutrition from "./components/DashboardNutrition";
import DashboardAssist from "./components/DashboardAssist";
import DashboardConnect from "./components/DashboardConnect";

let supabaseClientInstance: any = null;

export default function App() {
 const [route, setRoute] = useState<"landing" | "auth" | "dashboard">("landing");
 const [dashboardTab, setDashboardTab] = useState<"overview" | "money" | "nutrition" | "assist" | "connect">("overview");

 // Core App State
 const [profile, setProfile] = useState<Profile | null>(null);
 const [transactions, setTransactions] = useState<Transaction[]>([]);
 const [meals, setMeals] = useState<Meal[]>([]);

 // Theme State
 const [theme, setTheme] = useState<"light" | "dark">(
 () => (localStorage.getItem("fintrack_theme") as "light" | "dark") || "light"
 );

 useEffect(() => {
 const root = window.document.documentElement;
 root.classList.remove("light", "dark");
 root.classList.add(theme);
 localStorage.setItem("fintrack_theme", theme);
 }, [theme]);

 // Supabase dynamic config
 const [mode, setMode] = useState<"sandbox" | "supabase">("sandbox");
 const [supabaseUrl, setSupabaseUrl] = useState("");
 const [supabaseAnonKey, setSupabaseAnonKey] = useState("");

 // Attempt auto-login if Supabase keys exist in localStorage
 useEffect(() => {
 const savedUrl = localStorage.getItem("fintrack_supabase_url");
 const savedKey = localStorage.getItem("fintrack_supabase_key");
 const savedMode = localStorage.getItem("fintrack_mode") as "sandbox" | "supabase";

 if (savedMode === "sandbox") {
 // Auto-load Sandbox Session
 handleSandboxLaunch("Gummy Bear");
 } else if (savedMode === "supabase" && savedUrl && savedKey) {
 setMode("supabase");
 setSupabaseUrl(savedUrl);
 setSupabaseAnonKey(savedKey);
 
 try {
 supabaseClientInstance = createClient(savedUrl, savedKey);
 // Attempt getting current session
 supabaseClientInstance.auth.getSession().then(({ data: { session } }: any) => {
 if (session) {
 loadSupabaseUserData(session.user.id, session.user.email || "");
 }
 });
 } catch (err) {
 console.error("Auto-Supabase Client initialization failed:", err);
 }
 }
 }, []);

 const handleSandboxLaunch = (customName?: string) => {
 setMode("sandbox");
 localStorage.setItem("fintrack_mode", "sandbox");
 
 // Seed with rich mock datasets
 const sandboxProfile: Profile = {
 ...mockProfile,
 name: customName || "Gummy Bear",
 };
 const { transactions: mockTxns, meals: mockMeals } = generateMockData();

 setProfile(sandboxProfile);
 setTransactions(mockTxns);
 setMeals(mockMeals);
 setRoute("dashboard");
 };

 const loadSupabaseUserData = async (userId: string, email: string) => {
 if (!supabaseClientInstance) return;

 try {
 // 1. Fetch or create Profile
 let { data: profileData, error: profileErr } = await supabaseClientInstance
 .from("profiles")
 .select("*")
 .eq("id", userId)
 .single();

 if (profileErr || !profileData) {
 // Create initial default profile
 const defaultProfile = {
 id: userId,
 email: email,
 name: email.split("@")[0],
 monthly_budget: 35000,
 calorie_goal: 2200,
 protein_goal: 110,
 link_code: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
 };

 const { data: newProfile, error: createErr } = await supabaseClientInstance
 .from("profiles")
 .insert([defaultProfile])
 .select("*")
 .single();

 if (createErr) throw createErr;
 profileData = newProfile;
 }

 setProfile(profileData);

 // 2. Fetch Transactions
 const { data: txnsData } = await supabaseClientInstance
 .from("transactions")
 .select("*")
 .order("date", { ascending: false });
 
 setTransactions(txnsData || []);

 // 3. Fetch Meals
 const { data: mealsData } = await supabaseClientInstance
 .from("meals")
 .select("*")
 .order("date", { ascending: false });

 setMeals(mealsData || []);

 setRoute("dashboard");

 // Setup realtime push subscription
 setupRealtimeSubscriptions(userId);

 } catch (err) {
 console.error("Error loading user database tables:", err);
 }
 };

 const setupRealtimeSubscriptions = (userId: string) => {
 if (!supabaseClientInstance) return;

 // Realtime channel for Transactions
 const txnChannel = supabaseClientInstance
 .channel("transactions-changes")
 .on(
 "postgres_changes",
 { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
 (payload: any) => {
 if (payload.eventType === "INSERT") {
 setTransactions((prev) => [payload.new as Transaction, ...prev]);
 } else if (payload.eventType === "DELETE") {
 setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
 }
 }
 )
 .subscribe();

 // Realtime channel for Meals
 const mealsChannel = supabaseClientInstance
 .channel("meals-changes")
 .on(
 "postgres_changes",
 { event: "*", schema: "public", table: "meals", filter: `user_id=eq.${userId}` },
 (payload: any) => {
 if (payload.eventType === "INSERT") {
 setMeals((prev) => [payload.new as Meal, ...prev]);
 } else if (payload.eventType === "DELETE") {
 setMeals((prev) => prev.filter((m) => m.id !== payload.old.id));
 }
 }
 )
 .subscribe();

 return () => {
 supabaseClientInstance.removeChannel(txnChannel);
 supabaseClientInstance.removeChannel(mealsChannel);
 };
 };

 const handleAuthenticate = async (params: {
 mode: "sandbox" | "supabase";
 url?: string;
 anonKey?: string;
 email?: string;
 password?: string;
 isSignUp?: boolean;
 name?: string;
 }): Promise<{ success: boolean; error?: string }> => {
 if (params.mode === "sandbox") {
 handleSandboxLaunch(params.name);
 return { success: true };
 }

 // Supabase mode
 if (!params.url || !params.anonKey || !params.email || !params.password) {
 return { success: false, error: "Please configure all required fields." };
 }

 try {
 supabaseClientInstance = createClient(params.url, params.anonKey);
 setSupabaseUrl(params.url);
 setSupabaseAnonKey(params.anonKey);

 let authResult;
 if (params.isSignUp) {
 authResult = await supabaseClientInstance.auth.signUp({
 email: params.email,
 password: params.password,
 options: {
 data: {
 name: params.name || params.email.split("@")[0],
 }
 }
 });
 } else {
 authResult = await supabaseClientInstance.auth.signInWithPassword({
 email: params.email,
 password: params.password,
 });
 }

 if (authResult.error) {
 return { success: false, error: authResult.error.message };
 }

 const user = authResult.data.user;
 if (!user) {
 return { success: false, error: "Authentication failed. No user found." };
 }

 // Save credentials in browser localStorage for ease of revisit
 localStorage.setItem("fintrack_mode", "supabase");
 localStorage.setItem("fintrack_supabase_url", params.url);
 localStorage.setItem("fintrack_supabase_key", params.anonKey);
 setMode("supabase");

 // Load Tables
 await loadSupabaseUserData(user.id, user.email || "");
 return { success: true };

 } catch (err: any) {
 console.error(err);
 return { success: false, error: err?.message || "Check connection URL and try again." };
 }
 };

 const handleAddTransaction = async (newTxn: Transaction) => {
 // Optimistically update frontend state immediately
 setTransactions((prev) => [newTxn, ...prev]);

 if (mode === "supabase" && supabaseClientInstance) {
 try {
 const { error } = await supabaseClientInstance
 .from("transactions")
 .insert([newTxn]);
 if (error) throw error;
 } catch (err) {
 console.error("Error inserting transaction to Supabase:", err);
 }
 }
 };

 const handleAddMeal = async (newMeal: Meal) => {
 // Optimistically update frontend state immediately
 setMeals((prev) => [newMeal, ...prev]);

 if (mode === "supabase" && supabaseClientInstance) {
 try {
 const { error } = await supabaseClientInstance
 .from("meals")
 .insert([newMeal]);
 if (error) throw error;
 } catch (err) {
 console.error("Error inserting meal to Supabase:", err);
 }
 }
 };

 const handleLogout = async () => {
 if (mode === "supabase" && supabaseClientInstance) {
 await supabaseClientInstance.auth.signOut();
 }
 
 // Clear credentials & state
 localStorage.removeItem("fintrack_mode");
 localStorage.removeItem("fintrack_supabase_url");
 localStorage.removeItem("fintrack_supabase_key");
 supabaseClientInstance = null;

 setProfile(null);
 setTransactions([]);
 setMeals([]);
 setRoute("landing");
 };

 // Rendering Routing Views
 if (route === "landing") {
 return (
 <LandingPage 
 onGetStarted={() => setRoute("auth")} 
 onLogin={() => setRoute("auth")} 
 />
 );
 }

 if (route === "auth") {
 return (
 <AuthPage 
 onBack={() => setRoute("landing")} 
 onAuthenticate={handleAuthenticate}
 />
 );
 }

 return (
 <div className="min-h-screen bg-[#f9f9ff] text-slate-900 flex font-sans overflow-hidden">
 
 {/* SIDEBAR NAVIGATION PANEL */}
 <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 relative z-20 h-screen">
 {/* Brand label */}
 <div className="p-8 pb-10">
 <h1 className="font-sans font-extrabold text-2xl flex items-center gap-2">
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <rect x="2" y="10" width="4" height="10" rx="2" fill="#191c21" className="" />
 <rect x="8" y="5" width="4" height="15" rx="2" fill="#191c21" className="" />
 <rect x="14" y="14" width="4" height="6" rx="2" fill="#191c21" className="" />
 </svg>
 FinTrack
 </h1>
 </div>

 {/* Nav list */}
 <nav className="flex-1 space-y-1 px-4 flex flex-col gap-1">
 <button
 onClick={() => setDashboardTab("overview")}
 className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
 dashboardTab === "overview"
 ? "bg-slate-100 text-slate-900 "
 : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
 }`}
 >
 <LayoutDashboard size={18} className={dashboardTab === "overview" ? "text-slate-900 " : "text-slate-400"} /> Overview
 </button>

 <button
 onClick={() => setDashboardTab("money")}
 className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
 dashboardTab === "money"
 ? "bg-slate-100 text-slate-900 "
 : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
 }`}
 >
 <Coins size={18} className={dashboardTab === "money" ? "text-slate-900 " : "text-slate-400"} /> Money Ledger
 </button>

 <button
 onClick={() => setDashboardTab("nutrition")}
 className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
 dashboardTab === "nutrition"
 ? "bg-slate-100 text-slate-900 "
 : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
 }`}
 >
 <Utensils size={18} className={dashboardTab === "nutrition" ? "text-slate-900 " : "text-slate-400"} /> Nutrition
 </button>

 <button
 onClick={() => setDashboardTab("assist")}
 className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
 dashboardTab === "assist"
 ? "bg-slate-100 text-slate-900 "
 : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
 }`}
 >
 <Bot size={18} className={dashboardTab === "assist" ? "text-slate-900 " : "text-slate-400"} /> AI Assist
 </button>

 <button
 onClick={() => setDashboardTab("connect")}
 className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
 dashboardTab === "connect"
 ? "bg-slate-100 text-slate-900 "
 : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
 }`}
 >
 <LinkIcon size={18} className={dashboardTab === "connect" ? "text-slate-900 " : "text-slate-400"} /> Connect Integrations
 </button>
 </nav>

 {/* User profile footer bar */}
 <div className="p-4 mt-auto">
 <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer group">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
 <User size={16} className="text-slate-600 " />
 </div>
 <div className="overflow-hidden">
 <p className="text-sm font-medium text-slate-900 truncate">{profile?.name || "My Account"}</p>
 <p className="text-xs text-slate-500 truncate">{profile?.email || "Personal Workspace"}</p>
 </div>
 </div>
 <button 
 onClick={handleLogout}
 className="text-slate-400 hover:text-slate-700 transition opacity-0 group-hover:opacity-100"
 >
 <LogOut size={16} />
 </button>
 </div>
 </div>
 </aside>

 {/* MAIN SYSTEM BODY */}
 <main className="flex-1 flex flex-col h-screen overflow-hidden">
 {/* Top Header details */}
 <header className="h-[68px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8">
 <div className="text-lg font-semibold text-slate-900 capitalize font-sans">
 {dashboardTab}
 </div>
 </header>

 {/* View area container */}
 <div className="flex-1 overflow-y-auto p-10 bg-[#f9f9ff] ">
 <div className="max-w-[1100px]">
 {dashboardTab === "overview" && (
 <DashboardOverview 
 profile={profile!} 
 transactions={transactions} 
 meals={meals} 
 onAddTransaction={handleAddTransaction}
 onAddMeal={handleAddMeal}
 />
 )}

 {dashboardTab === "money" && (
 <DashboardMoney 
 profile={profile!} 
 transactions={transactions} 
 onAddTransaction={handleAddTransaction}
 />
 )}

 {dashboardTab === "nutrition" && (
 <DashboardNutrition 
 profile={profile!} 
 meals={meals} 
 transactions={transactions} 
 onAddMeal={handleAddMeal}
 />
 )}

 {dashboardTab === "assist" && (
 <DashboardAssist 
 profile={profile!} 
 transactions={transactions} 
 meals={meals} 
 />
 )}

 {dashboardTab === "connect" && (
 <DashboardConnect profile={profile!} />
 )}
 </div>
 </div>
 </main>
 </div>
 );
}
