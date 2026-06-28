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
  LogOut, 
  LayoutDashboard,
  Sun,
  Moon
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";

import { Profile, Transaction, Meal } from "./types";

// Import Modular Components
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import DashboardOverview from "./components/DashboardOverview";
import DashboardMoney from "./components/DashboardMoney";
import DashboardNutrition from "./components/DashboardNutrition";
import DashboardAssist from "./components/DashboardAssist";
import DashboardConnect from "./components/DashboardConnect";

// Initialize Supabase from Env Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Attempt auto-login if Session exists
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session) {
        loadSupabaseUserData(session.user.id, session.user.email || "");
      }
    });
  }, []);

  const handleAuthenticate = async (params: { email?: string; password?: string; isSignUp?: boolean; name?: string }) => {
    if (!supabase) return { success: false, error: "Database configuration missing." };
    if (!params.email || !params.password) return { success: false, error: "Email and password required." };

    if (params.isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: { name: params.name || params.email.split("@")[0] }
        }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await loadSupabaseUserData(data.user.id, data.user.email || "");
        return { success: true };
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await loadSupabaseUserData(data.user.id, data.user.email || "");
        return { success: true };
      }
    }
    return { success: false, error: "Unknown error occurred" };
  };

  const loadSupabaseUserData = async (userId: string, email: string) => {
    if (!supabase) return;

    try {
      // 1. Fetch or create Profile
      let { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileErr || !profileData) {
        const { data: { user } } = await supabase.auth.getUser();
        const userName = user?.user_metadata?.name || email.split("@")[0];
        
        const defaultProfile = {
          id: userId,
          email: email,
          name: userName,
          monthly_budget: 35000,
          calorie_goal: 2200,
          protein_goal: 110,
          link_code: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
        };

        const { data: newProfile, error: createErr } = await supabase
          .from("profiles")
          .insert([defaultProfile])
          .select("*")
          .single();

        if (createErr) throw createErr;
        profileData = newProfile;
      }

      setProfile(profileData);

      // 2. Fetch Transactions
      const { data: txnsData } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      
      setTransactions(txnsData || []);

      // 3. Fetch Meals
      const { data: mealsData } = await supabase
        .from("meals")
        .select("*")
        .order("date", { ascending: false });

      setMeals(mealsData || []);
      setRoute("dashboard");
      setupRealtimeSubscriptions(userId);

    } catch (err) {
      console.error("Error loading user database tables:", err);
    }
  };

  const setupRealtimeSubscriptions = (userId: string) => {
    if (!supabase) return;

    supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `profile_id=eq.${userId}` },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    supabase
      .channel("meals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meals", filter: `profile_id=eq.${userId}` },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setMeals((prev) => [payload.new as Meal, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setMeals((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();
  };

  const handleAddTransaction = async (newTxn: Transaction) => {
    setTransactions([newTxn, ...transactions]);
    if (supabase) {
      try {
        const { error } = await supabase.from("transactions").insert([newTxn]);
        if (error) throw error;
      } catch (err) {
        console.error("Error inserting transaction to Supabase:", err);
      }
    }
  };

  const handleAddMeal = async (newMeal: Meal) => {
    setMeals([newMeal, ...meals]);
    if (supabase) {
      try {
        const { error } = await supabase.from("meals").insert([newMeal]);
        if (error) throw error;
      } catch (err) {
        console.error("Error inserting meal to Supabase:", err);
      }
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
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
        theme={theme}
        toggleTheme={toggleTheme}
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
    <div className="min-h-screen bg-bg-app text-text-main flex font-sans overflow-hidden transition-colors duration-500 relative">
      <div className="grid-bg"></div>

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-64 glass-panel flex flex-col shrink-0 relative z-20 h-screen rounded-none border-t-0 border-b-0 border-l-0">
        {/* Brand label */}
        <div className="p-8 pb-10">
          <h1 className="font-display font-extrabold text-2xl flex items-center gap-2 text-accent">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="10" width="4" height="10" rx="2" fill="currentColor" />
              <rect x="8" y="5" width="4" height="15" rx="2" fill="currentColor" />
              <rect x="14" y="14" width="4" height="6" rx="2" fill="currentColor" />
            </svg>
            Fin<span className="text-text-main">Track</span>
          </h1>
        </div>

        {/* Nav list */}
        <nav className="flex-1 space-y-1 px-4 flex flex-col gap-1">
          <button
            onClick={() => setDashboardTab("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              dashboardTab === "overview"
                ? "bg-bg-btn text-accent shadow-sm"
                : "text-text-secondary hover:text-text-main hover:bg-border-subtle"
            }`}
          >
            <LayoutDashboard size={18} className={dashboardTab === "overview" ? "text-accent" : "text-text-muted"} /> Overview
          </button>

          <button
            onClick={() => setDashboardTab("money")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              dashboardTab === "money"
                ? "bg-bg-btn text-accent shadow-sm"
                : "text-text-secondary hover:text-text-main hover:bg-border-subtle"
            }`}
          >
            <Coins size={18} className={dashboardTab === "money" ? "text-accent" : "text-text-muted"} /> Money Ledger
          </button>

          <button
            onClick={() => setDashboardTab("nutrition")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              dashboardTab === "nutrition"
                ? "bg-bg-btn text-accent shadow-sm"
                : "text-text-secondary hover:text-text-main hover:bg-border-subtle"
            }`}
          >
            <Utensils size={18} className={dashboardTab === "nutrition" ? "text-accent" : "text-text-muted"} /> Nutrition
          </button>

          <button
            onClick={() => setDashboardTab("assist")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              dashboardTab === "assist"
                ? "bg-bg-btn text-accent shadow-sm"
                : "text-text-secondary hover:text-text-main hover:bg-border-subtle"
            }`}
          >
            <Bot size={18} className={dashboardTab === "assist" ? "text-accent" : "text-text-muted"} /> AI Assist
          </button>

          <button
            onClick={() => setDashboardTab("connect")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              dashboardTab === "connect"
                ? "bg-bg-btn text-accent shadow-sm"
                : "text-text-secondary hover:text-text-main hover:bg-border-subtle"
            }`}
          >
            <LinkIcon size={18} className={dashboardTab === "connect" ? "text-accent" : "text-text-muted"} /> Integrations
          </button>
        </nav>

        {/* User profile footer bar */}
        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between p-3 bg-bg-app hover:bg-border-subtle border border-border-main rounded-xl transition cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-border-subtle flex items-center justify-center shrink-0">
                <User size={16} className="text-text-muted" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-text-main truncate">{profile?.name || "User"}</p>
                <p className="text-xs text-text-muted truncate">{profile?.email || "Account"}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-text-muted hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN SYSTEM BODY */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Header details */}
        <header className="h-[76px] flex-shrink-0 glass-header flex items-center justify-between px-8">
          <div className="text-xl font-bold text-text-main capitalize font-display">
            {dashboardTab}
          </div>
          
          {/* THEME TOGGLE BUTTON */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-bg-btn border border-border-main text-text-secondary hover:text-accent transition-colors shadow-sm"
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "light" ? (
                  <motion.div
                    key="sun"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </header>

        {/* View area container */}
        <div className="flex-1 overflow-y-auto p-10 relative">
          <div className="max-w-[1100px] mx-auto">
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
