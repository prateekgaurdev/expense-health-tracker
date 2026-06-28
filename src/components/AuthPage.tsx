/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
 Lock, 
 Server, 
 Key, 
 FlaskConical, 
 AlertTriangle, 
 ArrowRight, 
 ArrowLeft, 
 Sparkles,
 ShieldCheck,
 CheckCircle2,
 Terminal,
 Activity,
 Coins
} from "lucide-react";
import { motion } from "motion/react";

interface AuthPageProps {
 onBack: () => void;
 onAuthenticate: (params: {
 mode: "sandbox" | "supabase";
 url?: string;
 anonKey?: string;
 email?: string;
 password?: string;
 isSignUp?: boolean;
 name?: string;
 }) => Promise<{ success: boolean; error?: string }>;
}

export default function AuthPage({ onBack, onAuthenticate }: AuthPageProps) {
 const [authMode, setAuthMode] = useState<"sandbox" | "supabase">("sandbox");
 const [isSignUp, setIsSignUp] = useState(false);
 const [loading, setLoading] = useState(false);
 const [errorMsg, setErrorMsg] = useState("");

 // Supabase input states
 const [url, setUrl] = useState("");
 const [anonKey, setAnonKey] = useState("");
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setErrorMsg("");

 try {
 const res = await onAuthenticate({
 mode: authMode,
 url: authMode === "supabase" ? url : undefined,
 anonKey: authMode === "supabase" ? anonKey : undefined,
 email: authMode === "supabase" ? email : (email || "sandbox@fintrack.io"),
 password: authMode === "supabase" ? password : (password || "sandbox123"),
 isSignUp: authMode === "supabase" ? isSignUp : false,
 name: authMode === "sandbox" ? (name || "Gummy Bear") : name,
 });

 if (!res.success) {
 setErrorMsg(res.error || "Authentication failed. Check your credentials.");
 }
 } catch (err: any) {
 setErrorMsg(err?.message || "An unexpected error occurred.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans relative overflow-hidden">
 
 {/* Decorative Blur Orbs */}
 <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
 <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

 {/* LEFT PANEL: SLICK INFO HUB */}
 <div className="hidden md:flex md:w-5/12 bg-white border-r border-slate-200/80 p-12 flex-col justify-between relative overflow-hidden shrink-0">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.02),transparent)] pointer-events-none"></div>
 
 {/* Top Header info */}
 <div>
 <button 
 onClick={onBack}
 className="flex items-center gap-2 text-xs font-mono tracking-widest text-slate-600 hover:text-emerald-600 transition cursor-pointer"
 >
 <ArrowLeft size={14} /> BACK TO HOMEPAGE
 </button>
 </div>

 {/* Feature Cards / Gimmicks */}
 <div className="space-y-8 my-auto max-w-sm">
 <div className="space-y-2">
 <span className="text-emerald-600 font-display font-extrabold text-3xl tracking-tighter">
 ◢ Fin<span className="text-slate-900">Track</span>
 </span>
 <p className="text-slate-600 text-sm mt-2 font-medium">Secure access to your personal finance and health tracker</p>
 </div>

 <h3 className="text-xl font-bold text-slate-900 leading-snug">
 Choose how you wish to experience your financial tracker.
 </h3>

 <div className="space-y-4">
 <div className="flex items-start gap-3 bg-white/40 p-4 rounded-xl border border-slate-200">
 <FlaskConical className="text-emerald-600 shrink-0 mt-0.5" size={18} />
 <div>
 <h4 className="text-xs font-mono font-bold uppercase text-slate-200">Sandbox Trial Mode</h4>
 <p className="text-xs text-slate-600 mt-1 leading-relaxed">
 Boot a local offline sandbox with preloaded datasets and full AI accessibility instantly.
 </p>
 </div>
 </div>

 <div className="flex items-start gap-3 bg-white/40 p-4 rounded-xl border border-slate-200">
 <Server className="text-blue-600 shrink-0 mt-0.5" size={18} />
 <div>
 <h4 className="text-xs font-mono font-bold uppercase text-slate-200">Supabase DB Sync</h4>
 <p className="text-xs text-slate-600 mt-1 leading-relaxed">
 Bind your private database URL and keys to store your custom transaction ledgers securely.
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Security badge footer */}
 <div className="flex items-center gap-2.5 text-xs text-slate-600 font-mono">
 <ShieldCheck size={16} className="text-emerald-500" />
 <span>AES-256 Client-Side Key Storage</span>
 </div>
 </div>

 {/* RIGHT PANEL: DUAL CONFIG FORM */}
 <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
 
 {/* Floating controls for mobile */}
 <div className="absolute top-6 left-6 md:hidden">
 <button 
 onClick={onBack}
 className="flex items-center gap-1.5 text-xs font-mono tracking-widest text-slate-600 hover:text-emerald-600 transition cursor-pointer"
 >
 <ArrowLeft size={14} /> BACK
 </button>
 </div>

 <motion.div 
 initial={{ opacity: 0, scale: 0.97, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ duration: 0.45 }}
 className="w-full max-w-md space-y-6"
 >
 {/* Form Header */}
 <div className="text-center md:text-left space-y-1">
 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Control Center</h2>
 <p className="text-slate-600 text-sm mt-1">Set up your workspace or connect your secure cloud account</p>
 </div>

 {/* Form Box */}
 <div className="bg-white/80 border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-md space-y-6">
 
 {/* Mode toggle bar */}
 <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
 <button
 type="button"
 onClick={() => {
 setAuthMode("sandbox");
 setErrorMsg("");
 }}
 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
 authMode === "sandbox"
 ? "bg-white text-emerald-600 border border-slate-200"
 : "text-slate-600 hover:text-slate-200"
 }`}
 >
 <FlaskConical size={13} /> Sandbox Demo
 </button>
 <button
 type="button"
 onClick={() => {
 setAuthMode("supabase");
 setErrorMsg("");
 }}
 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
 authMode === "supabase"
 ? "bg-white text-blue-600 border border-slate-200"
 : "text-slate-600 hover:text-slate-200"
 }`}
 >
 <Server size={13} /> Supabase Sync
 </button>
 </div>

 {/* Sandbox form view */}
 {authMode === "sandbox" ? (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed space-y-2">
 <p className="font-semibold text-emerald-500 flex items-center gap-1.5 text-sm">Instant Sandbox Ready</p>
 <p>
 We have loaded a realistic dataset representing <b>6 months</b> of capital ledgers and diet charts to let you explore the complete system without any manual configurations.
 </p>
 </div>

 <div className="space-y-2">
 <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-600 font-bold">
 YOUR PROFILE CODENAME
 </label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. Gummy Bear"
 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none font-mono"
 />
 </div>

 {errorMsg && (
 <div className="text-rose-400 text-xs font-mono bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl flex items-center gap-2 animate-shake">
 <AlertTriangle size={14} /> {errorMsg}
 </div>
 )}

 <motion.button
 type="submit"
 disabled={loading}
 whileHover={{ scale: 1.01 }}
 whileTap={{ scale: 0.99 }}
 className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold py-3.5 rounded-xl transition duration-200 text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.25)] cursor-pointer"
 >
 {loading ? "Warming Engine..." : "Boot Sandbox Workspace"} <ArrowRight size={15} />
 </motion.button>
 </form>
 ) : (
 // Supabase mode
 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed space-y-2">
 <p className="font-semibold text-blue-500 flex items-center gap-1.5 text-sm">Cloud Sync Enabled</p>
 <p>
 All transactions and meals are securely stored directly in your personal Supabase cluster.
 </p>
 </div>

 <div className="grid grid-cols-1 gap-3.5">
 <div className="space-y-1.5">
 <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-600 font-bold">
 Supabase Project URL
 </label>
 <input
 type="url"
 required
 value={url}
 onChange={(e) => setUrl(e.target.value)}
 placeholder="https://your-project.supabase.co"
 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none font-mono"
 />
 </div>
 <div className="space-y-1.5">
 <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-600 font-bold">
 Supabase Anon Key
 </label>
 <input
 type="password"
 required
 value={anonKey}
 onChange={(e) => setAnonKey(e.target.value)}
 placeholder="eyJhbGciOiJIUzI1NiIs..."
 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none font-mono"
 />
 </div>
 </div>

 <div className="border-t border-slate-200/60 pt-4 space-y-3.5">
 <div className="flex bg-white border border-slate-200 p-1 rounded-lg max-w-max mx-auto mb-2">
 <button
 type="button"
 onClick={() => setIsSignUp(false)}
 className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition ${
 !isSignUp ? "bg-white text-blue-600" : "text-slate-600 hover:text-slate-600"
 }`}
 >
 Login
 </button>
 <button
 type="button"
 onClick={() => setIsSignUp(true)}
 className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition ${
 isSignUp ? "bg-white text-blue-600" : "text-slate-600 hover:text-slate-600"
 }`}
 >
 Register
 </button>
 </div>

 {isSignUp && (
 <div className="space-y-1.5">
 <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-600 font-bold">
 Full Name
 </label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. Gummy Bear"
 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none font-mono"
 />
 </div>
 )}

 <div className="space-y-1.5">
 <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-600 font-bold">
 Email Address
 </label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="you@example.com"
 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none font-mono"
 />
 </div>

 <div className="space-y-1.5">
 <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-600 font-bold">
 Secret Password
 </label>
 <input
 type="password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none font-mono"
 />
 </div>
 </div>

 {errorMsg && (
 <div className="text-rose-400 text-xs font-mono bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl flex items-center gap-2 animate-shake">
 <AlertTriangle size={14} /> {errorMsg}
 </div>
 )}

 <motion.button
 type="submit"
 disabled={loading}
 whileHover={{ scale: 1.01 }}
 whileTap={{ scale: 0.99 }}
 className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold py-3.5 rounded-xl transition duration-200 text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.25)] cursor-pointer"
 >
 {loading ? "Authenticating Cloud..." : isSignUp ? "Establish Account" : "Access Workspace"} <ArrowRight size={15} />
 </motion.button>
 </form>
 )}
 </div>
 </motion.div>
 </div>
 </div>
 );
}
