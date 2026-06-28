/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
 Sparkles, 
 TrendingUp, 
 Send, 
 Activity, 
 ArrowRight, 
 Lock, 
 Database, 
 Utensils, 
 Zap, 
 MessageSquare,
 Terminal,
 Shield,
 Clock,
 CheckCircle2,
 PieChart,
 LineChart,
 Brain,
 Smartphone,
 Sun,
 Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function LandingPage({ onGetStarted, onLogin, theme, toggleTheme }: LandingPageProps) {
 const [simText, setSimText] = useState("swiggy 420 dinner 🍛");
 const [isTyping, setIsTyping] = useState(false);
 const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
 { sender: "user", text: "swiggy 420 dinner 🍛" },
 { sender: "bot", text: "✅ Logged: ₹420 under Food\n🍱 Est. Calories: ~680 kcal, 24g Protein\n📈 Today: 1,840 / 2,200 kcal" },
 ]);
 const [previewSpent, setPreviewSpent] = useState(14850);
 const [previewCalories, setPreviewCalories] = useState(1840);
 const [previewProtein, setPreviewProtein] = useState(92);

 const simulateLogs = [
 {
 input: "ola 250 office auto",
 reply: "✅ Logged: ₹250 under Travel\n🚗 Note: 'office auto'",
 spentAdd: 250,
 calAdd: 0,
 protAdd: 0
 },
 {
 input: "got salary 85000",
 reply: "💰 Income Received: +₹85,000\n💼 Note: 'salary'",
 spentAdd: 0,
 calAdd: 0,
 protAdd: 0
 },
 {
 input: "lunch chicken salad & boiled egg",
 reply: "🍱 Logged Meal: chicken salad & boiled egg\n🔥 Est. Calories: ~380 kcal, 35g Protein\n💪 Health rating: 10/10",
 spentAdd: 0,
 calAdd: 380,
 protAdd: 35
 },
 {
 input: "blinkit 850 bread and milk",
 reply: "✅ Logged: ₹850 under Groceries\n🛒 Note: 'bread and milk'",
 spentAdd: 850,
 calAdd: 0,
 protAdd: 0
 }
 ];

 const handleSimulate = (e: React.FormEvent) => {
 e.preventDefault();
 if (!simText.trim()) return;

 const currentText = simText;
 setSimText("");

 // Add user message
 setMessages((prev) => [...prev, { sender: "user", text: currentText }]);
 setIsTyping(true);

 const matchedLog = simulateLogs.find(
 (log) => currentText.toLowerCase().includes(log.input.split(" ")[0])
 ) || {
 input: currentText,
 reply: `✅ Logged: parsed naturally\nEstimated categories and metrics saved to your database!`,
 spentAdd: 120,
 calAdd: 150,
 protAdd: 8
 };

 // Simulate bot response delay
 setTimeout(() => {
 setIsTyping(false);
 setMessages((prev) => [...prev, { sender: "bot", text: matchedLog.reply }]);
 setPreviewSpent((prev) => prev + matchedLog.spentAdd);
 setPreviewCalories((prev) => Math.min(2200, prev + matchedLog.calAdd));
 setPreviewProtein((prev) => Math.min(110, prev + matchedLog.protAdd));
 }, 1200);
 };

 // Pre-fill input when clicking chips
 const fillChip = (text: string) => {
 setSimText(text);
 };

 return (
 <div className="relative min-h-screen bg-border-subtle text-text-main overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
 
 {/* GLOWING ORBS BACKGROUND */}
 <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
 <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none"></div>
 
 {/* FLOATING HEADER NAV */}
 <header className="sticky top-0 z-50 border-b border-border-main glass-panel/70 backdrop-blur-xl">
 <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <span className="text-emerald-600 font-display font-extrabold text-2xl tracking-tighter flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer">
 <span className="text-emerald-500 font-black">◢</span> Fin<span className="text-text-main">Track</span>
 </span>
 <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest bg-border-subtle text-emerald-600 px-3 py-1 border border-border-main rounded-full">
 v2.4.0 PRO
 </span>
 </div>

 <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-emerald-600 hover:glass-panel/40 rounded-xl transition font-mono"
          >
            Sign In
          </button>
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
                  <Sun size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
 <motion.button 
 onClick={onGetStarted}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition duration-300 shadow-lg shadow-emerald-500/20 font-mono flex items-center gap-2 cursor-pointer"
 >
 Launch App <ArrowRight size={14} />
 </motion.button>
 </div>
 </div>
 </header>

 {/* HERO SECTION */}
 <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-12 gap-12 items-center">
 <motion.div 
 initial={{ opacity: 0, y: 25 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: "easeOut" }}
 className="lg:col-span-7 space-y-8"
 >
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.15 }}
 className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-emerald-600 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider font-mono shadow-sm shadow-emerald-500/10"
 >
 <Zap size={12} className="text-emerald-600 animate-pulse" /> Self-Hosted Budget & Diet AI Engine
 </motion.div>
 
 <h1 className="text-5xl md:text-7.5xl font-extrabold tracking-tight leading-[1.1] text-text-main">
 Unify your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">ledger</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">nutrition</span> through a simple chat bot.
 </h1>

 <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
 End the era of exhausting spreadsheets and rigid ledger applications. Just message your secure chatbot in raw, natural language and watch your personal metrics sync in milliseconds.
 </p>

 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
 <motion.button 
 onClick={onGetStarted}
 whileHover={{ scale: 1.02, y: -2 }}
 whileTap={{ scale: 0.98 }}
 className="bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-white font-extrabold px-8 py-4 rounded-2xl transition duration-300 shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 text-base group cursor-pointer"
 >
 Launch Live App <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
 </motion.button>
 <motion.a 
 href="#features"
 whileHover={{ scale: 1.02, y: -2 }}
 whileTap={{ scale: 0.98 }}
 className="border border-border-main hover:border-slate-300 glass-panel/40 hover:glass-panel text-text-secondary hover:text-emerald-600 px-7 py-4 rounded-2xl transition duration-300 flex items-center justify-center gap-2 text-base cursor-pointer"
 >
 Explore Features
 </motion.a>
 </div>

 <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border-main/60 max-w-lg">
 <div className="space-y-1.5">
 <p className="text-3xl font-bold text-text-main font-mono">1.2s</p>
 <p className="text-xs text-accent font-semibold uppercase tracking-wider">AI Inference</p>
 </div>
 <div className="space-y-1.5">
 <p className="text-3xl font-bold text-emerald-600 font-mono">100%</p>
 <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Data Privacy</p>
 </div>
 <div className="space-y-1.5">
 <p className="text-3xl font-bold text-accent font-mono">2-in-1</p>
 <p className="text-xs text-purple-500 font-semibold uppercase tracking-wider">Holistic Tracking</p>
 </div>
 </div>
 </motion.div>

 {/* INTERACTIVE CHAT & METRICS WIDGET */}
 <motion.div 
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
 className="lg:col-span-5 space-y-6"
 >
 <div className="glass-panel/80 border border-border-main rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-lg">
 {/* Bot Header */}
 <div className="glass-panel/80 px-5 py-4 border-b border-border-main flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="relative">
 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md">
 <Smartphone size={18} />
 </div>
 <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
 </div>
 <div>
 <h4 className="text-sm font-bold text-text-main">FinTrack Bot</h4>
 <p className="text-xs text-emerald-600 font-mono tracking-wide">online · ready to parse</p>
 </div>
 </div>
 <div className="text-[10px] glass-panel border border-border-main text-text-secondary px-2 py-0.5 rounded font-mono">
 SIMULATOR
 </div>
 </div>

 {/* Simulated Chat History */}
 <div className="h-72 overflow-y-auto p-5 space-y-4 glass-panel/30 flex flex-col">
 <div className="flex-1"></div>
 {messages.map((msg, idx) => (
 <motion.div 
 initial={{ opacity: 0, scale: 0.96, y: 8 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ duration: 0.25 }}
 key={idx}
 className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
 >
 <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
 msg.sender === "user" 
 ? "bg-emerald-500 text-white font-semibold rounded-br-none shadow-[0_4px_12px_rgba(16,185,129,0.25)]" 
 : "bg-border-subtle border border-border-main text-text-main font-mono text-xs whitespace-pre-line rounded-bl-none"
 }`}>
 {msg.text}
 </div>
 </motion.div>
 ))}
 
 {isTyping && (
 <div className="flex justify-start">
 <div className="glass-panel border border-border-main rounded-2xl rounded-bl-none px-4 py-3 text-xs text-text-secondary font-mono flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
 </div>
 </div>
 )}
 </div>

 {/* Quick Chips */}
 <div className="px-5 py-2.5 glass-panel border-t border-border-main flex gap-2 overflow-x-auto no-scrollbar">
 <button 
 onClick={() => fillChip("ola 250 office auto")}
 className="shrink-0 text-[10px] font-mono bg-bg-app hover:bg-border-subtle text-text-secondary hover:text-text-main px-2.5 py-1 rounded-lg border border-border-main transition"
 >
 + ola 250
 </button>
 <button 
 onClick={() => fillChip("lunch chicken salad & boiled egg")}
 className="shrink-0 text-[10px] font-mono bg-bg-app hover:bg-border-subtle text-text-secondary hover:text-text-main px-2.5 py-1 rounded-lg border border-border-main transition"
 >
 + lunch chicken
 </button>
 <button 
 onClick={() => fillChip("blinkit 850 bread and milk")}
 className="shrink-0 text-[10px] font-mono bg-bg-app hover:bg-border-subtle text-text-secondary hover:text-text-main px-2.5 py-1 rounded-lg border border-border-main transition"
 >
 + blinkit 850
 </button>
 </div>

 {/* Chat Input Form */}
 <form onSubmit={handleSimulate} className="p-4 glass-panel border-t border-border-main flex gap-2">
 <input 
 type="text"
 value={simText}
 onChange={(e) => setSimText(e.target.value)}
 placeholder="Type here to test..."
 className="flex-1 glass-panel border border-border-main focus:border-emerald-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono"
 />
 <motion.button 
 type="submit"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 className="bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center"
 >
 <Send size={16} />
 </motion.button>
 </form>
 </div>

 {/* SIMULATED METRICS DASHBOARD VIEW */}
 <div className="glass-panel/60 border border-border-main rounded-2xl p-5 font-mono text-xs space-y-4 shadow-lg backdrop-blur-md">
 <div className="flex justify-between border-b border-border-main/60 pb-2.5">
 <span className="text-text-secondary font-bold flex items-center gap-1.5">
 <Terminal size={12} /> CORE ANALYTICAL CORE
 </span>
 <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM OK
 </span>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1 glass-panel/40 p-3 rounded-xl border border-border-main">
 <span className="text-xs text-text-secondary font-medium">Monthly Spent</span>
 <p className="text-base font-bold text-emerald-600 font-mono">₹{previewSpent.toLocaleString()}</p>
 </div>
 <div className="space-y-1 glass-panel/40 p-3 rounded-xl border border-border-main">
 <span className="text-xs text-text-secondary font-medium">Daily Protein</span>
 <p className="text-base font-bold text-accent font-mono">{previewProtein}g / 110g</p>
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex justify-between items-center text-[10px]">
 <span className="text-text-secondary">CALORIES LOGGED TODAY:</span>
 <span className="text-amber-400 font-bold">{previewCalories} / 2200 kcal</span>
 </div>
 <div className="w-full glass-panel h-2 rounded-full overflow-hidden">
 <motion.div 
 className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 h-full" 
 initial={{ width: "0%" }}
 animate={{ width: `${(previewCalories / 2200) * 100}%` }}
 transition={{ duration: 0.5 }}
 ></motion.div>
 </div>
 </div>
 </div>
 </motion.div>
 </section>

 {/* DETAILED FEATURES BENTO GRID */}
 <section id="features" className="relative z-10 border-t border-border-main glass-panel py-28">
 <div className="max-w-7xl mx-auto px-6">
 <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
 <h2 className="text-sm text-emerald-500 font-semibold uppercase tracking-wider mb-2">Core Capabilities</h2>
 <p className="text-4xl font-display font-black text-text-main leading-tight">
 Tailored specifically for modern health and wealth optimization.
 </p>
 <p className="text-text-secondary">
 One central portal syncing your physical energy inputs alongside your financial capital outputs in absolute real-time.
 </p>
 </div>

 <div className="grid md:grid-cols-3 gap-8">
 {/* Bento Card 1 */}
 <motion.div 
 whileHover={{ y: -6 }}
 className="md:col-span-2 glass-panel border border-border-main p-8 rounded-3xl relative overflow-hidden group"
 >
 <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-500"></div>
 <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-emerald-600 mb-6">
 <Brain size={22} />
 </div>
 <h3 className="text-xl font-bold text-text-main mb-3">Natural Language Parsing Engine</h3>
 <p className="text-text-secondary text-sm leading-relaxed mb-6">
 Powered by Gemini Flash AI, our custom parsers break down statements like <code className="text-accent font-mono bg-border-subtle border border-border-main px-1.5 py-0.5 rounded">"had biryani 350"</code> or <code className="text-accent font-mono bg-border-subtle border border-border-main px-1.5 py-0.5 rounded">"uber to office 180"</code> with supreme category accuracy.
 </p>
 <div className="flex gap-4 text-xs font-mono text-text-secondary">
 <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600" /> Multi-currency Ready</span>
 <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600" /> Contextual AI corrections</span>
 </div>
 </motion.div>

 {/* Bento Card 2 */}
 <motion.div 
 whileHover={{ y: -6 }}
 className="glass-panel border border-border-main p-8 rounded-3xl relative overflow-hidden group"
 >
 <div className="w-12 h-12 rounded-xl bg-accent/10 border border-cyan-500/20 flex items-center justify-center text-accent mb-6">
 <Lock size={22} />
 </div>
 <h3 className="text-xl font-bold text-text-main mb-3">100% Private Ownership</h3>
 <p className="text-text-secondary text-sm leading-relaxed">
 Connect your private Supabase backend. All data lives on your own servers with zero corporate analytics tracking your bank accounts or health patterns.
 </p>
 </motion.div>

 {/* Bento Card 3 */}
 <motion.div 
 whileHover={{ y: -6 }}
 className="glass-panel border border-border-main p-8 rounded-3xl relative overflow-hidden group"
 >
 <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
 <PieChart size={22} />
 </div>
 <h3 className="text-xl font-bold text-text-main mb-3">Budget Burn Bars</h3>
 <p className="text-text-secondary text-sm leading-relaxed">
 Visualise your real-time spend paces against monthly caps. Avoid sudden spikes and monitor projected cashout levels with precision pacing cards.
 </p>
 </motion.div>

 {/* Bento Card 4 */}
 <motion.div 
 whileHover={{ y: -6 }}
 className="md:col-span-2 glass-panel border border-border-main p-8 rounded-3xl relative overflow-hidden group"
 >
 <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-500"></div>
 <div className="w-12 h-12 rounded-xl bg-accent/10 border border-cyan-500/20 flex items-center justify-center text-accent mb-6">
 <Utensils size={22} />
 </div>
 <h3 className="text-xl font-bold text-text-main mb-3">Protein and Caloric Ring Analytics</h3>
 <p className="text-text-secondary text-sm leading-relaxed mb-6">
 Analyze daily nutrition goals using responsive rings. FinTrack automatically calculates macronutrient weights for logged ingredients and aggregates your metrics.
 </p>
 <div className="flex gap-4 text-xs font-mono text-text-secondary">
 <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-accent" /> Auto-estimate macros</span>
 <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-accent" /> Nutrition history curves</span>
 </div>
 </motion.div>
 </div>
 </div>
 </section>

 {/* METRIC CROSSOVER DEMO */}
 <section className="relative z-10 py-24 max-w-7xl mx-auto px-6">
 <div className="grid md:grid-cols-2 gap-16 items-center">
 <div className="space-y-6">
 <h2 className="text-sm text-accent font-semibold uppercase tracking-wider mb-2">Wealth & Health Crossover</h2>
 <h3 className="text-3xl md:text-4xl font-display font-black text-text-main leading-tight">
 Bridge your dining expenditure directly to physical muscle gain.
 </h3>
 <p className="text-text-secondary leading-relaxed text-sm md:text-base">
 Calculate cost-effectiveness with dynamic correlations like <b className="text-emerald-600 font-mono">₹ per 100 kcal</b> or <b className="text-accent font-mono">₹ per gram of protein</b>. Monitor whether premium spending actually supports your workout targets or merely adds empty sugar weight.
 </p>
 <ul className="space-y-3 text-xs md:text-sm text-text-secondary font-mono">
 <li className="flex items-center gap-2.5">
 <span className="w-5 h-5 bg-accent/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-600 text-[10px]">1</span>
 Auto-correlate meal costs with nutrition datasets
 </li>
 <li className="flex items-center gap-2.5">
 <span className="w-5 h-5 bg-accent/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-600 text-[10px]">2</span>
 Filter out expensive low-nutrition cheat days
 </li>
 <li className="flex items-center gap-2.5">
 <span className="w-5 h-5 bg-accent/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-600 text-[10px]">3</span>
 Track fitness accomplishments with budget awareness
 </li>
 </ul>
 </div>

 <div className="glass-panel/60 border border-border-main p-8 rounded-3xl grid grid-cols-3 gap-6 text-center items-center relative overflow-hidden backdrop-blur-md">
 <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>
 
 <div className="space-y-3">
 <div className="mx-auto w-20 h-20 rounded-2xl border border-border-main glass-panel flex flex-col items-center justify-center">
 <span className="text-lg font-bold text-text-main font-mono">83%</span>
 <span className="text-[9px] text-text-secondary uppercase tracking-widest font-mono">Cal</span>
 </div>
 <p className="text-[10px] text-text-secondary font-mono font-bold uppercase tracking-wider">Calories Goal</p>
 <p className="text-[11px] text-text-secondary font-mono">1.8k / 2.2k kcal</p>
 </div>

 <div className="space-y-3">
 <div className="mx-auto w-20 h-20 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col items-center justify-center animate-pulse">
 <span className="text-lg font-bold text-emerald-600 font-mono">92g</span>
 <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-mono">Prot</span>
 </div>
 <p className="text-[10px] text-text-secondary font-mono font-bold uppercase tracking-wider">Protein Logged</p>
 <p className="text-[11px] text-text-secondary font-mono">Goal: 110g</p>
 </div>

 <div className="space-y-3">
 <div className="mx-auto w-20 h-20 rounded-2xl border border-border-main glass-panel flex flex-col items-center justify-center">
 <span className="text-lg font-bold text-text-main font-mono">8.4</span>
 <span className="text-[9px] text-text-secondary uppercase tracking-widest font-mono">Score</span>
 </div>
 <p className="text-[10px] text-text-secondary font-mono font-bold uppercase tracking-wider">Health Rating</p>
 <p className="text-[11px] text-text-secondary font-mono">Highly consistent</p>
 </div>
 </div>
 </div>
 </section>

 {/* FOOTER */}
 <footer className="border-t border-border-main glass-panel py-12 relative z-10">
 <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
 <div className="flex items-center gap-2">
 <span className="text-emerald-600 font-display font-extrabold text-lg tracking-tighter">
 ◢ Fin<span className="text-text-main">Track</span>
 </span>
 <span className="text-xs text-text-secondary font-mono">| Self-Hosted Finance & Diet Platform</span>
 </div>
 <p className="text-xs text-text-secondary font-mono">
 © 2026 FinTrack. 100% client-side privacy secured. No tracking cookies.
 </p>
 </div>
 </footer>
 </div>
 );
}
