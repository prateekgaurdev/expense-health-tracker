import React, { useState } from "react";
import { 
 Copy, 
 Check, 
 Send, 
 MessageSquare, 
 ShieldCheck, 
 RefreshCw, 
 ExternalLink,
 ChevronRight,
 Info,
 Link,
 Terminal
} from "lucide-react";
import { Profile } from "../types";
import { motion } from "motion/react";

interface DashboardConnectProps {
 profile: Profile;
}

export default function DashboardConnect({ profile }: DashboardConnectProps) {
 const [copied, setCopied] = useState(false);

 const handleCopy = () => {
 navigator.clipboard.writeText(`/link ${profile.link_code || "FT-9402"}`);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="w-full text-slate-900 font-sans max-w-7xl mx-auto"
 >
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">Integrations</h1>
 <p className="text-slate-500 text-sm">Connect external platforms to log data instantly.</p>
 </div>
 </div>
 
 <div className="space-y-8">
 {/* CONNECTION STATUS BANNER */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

 <div className="space-y-3 relative z-10">
 <div className="flex items-center gap-2">
 <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
 <MessageSquare size={16} />
 </div>
 <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Telegram Bot</p>
 </div>
 <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
 Connect Telegram to Your Account
 </h2>
 <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
 Whenever you message your private Telegram bot, our servers securely process the input via Gemini and instantly reflect the entries here.
 </p>
 </div>

 {profile.telegram_chat_id ? (
 <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl text-sm space-y-1.5 flex-shrink-0 relative z-10 shadow-sm">
 <p className="font-semibold flex items-center gap-2">
 <ShieldCheck size={18} className="text-emerald-500"/> Connection Active
 </p>
 <p className="text-emerald-600/80 font-mono text-xs">Chat ID: {profile.telegram_chat_id}</p>
 </div>
 ) : (
 <div className="bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 rounded-xl text-sm space-y-1.5 flex-shrink-0 relative z-10 shadow-sm">
 <p className="font-semibold flex items-center gap-2">
 <RefreshCw size={16} className="animate-spin text-amber-500" /> Awaiting Bot Link
 </p>
 <p className="text-amber-600/80 text-xs">No active link found</p>
 </div>
 )}
 </motion.div>

 <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
 
 {/* Code Generator & Instructions */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.2 }}
 className="md:col-span-7 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl space-y-8 shadow-sm relative overflow-hidden"
 >
 <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
 <div className="p-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg">
 <Link size={18} />
 </div>
 <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
 Connecting in 1 Step
 </h3>
 </div>

 <div className="space-y-4">
 <p className="text-sm text-slate-600 leading-relaxed">
 Copy this command and send it directly to your Telegram bot. This pairs your Telegram chat account to this secure web dashboard session.
 </p>

 <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
 <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Copy command</span>
 <p className="text-lg font-mono font-bold text-slate-900 select-all tracking-wide bg-white px-3 py-1.5 rounded-md border border-slate-200 mt-1 shadow-sm">
 /link {profile.link_code || "FT-9402"}
 </p>
 </div>

 <button
 onClick={handleCopy}
 className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium cursor-pointer shadow-sm hover:shadow active:scale-95"
 >
 {copied ? (
 <>
 <Check size={16} /> Copied!
 </>
 ) : (
 <>
 <Copy size={16} /> Copy Text
 </>
 )}
 </button>
 </div>
 </div>

 <div className="space-y-4 pt-4">
 <h4 className="text-sm font-semibold text-slate-900 tracking-tight">What happens next:</h4>
 <ul className="space-y-4 text-sm text-slate-600">
 <li className="flex items-start gap-4">
 <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs mt-0.5 shadow-sm">1</span>
 <span className="pt-1">The bot responds with <b className="text-slate-900 font-medium">"✅ Pair successful! Hello Gummy Bear."</b></span>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs mt-0.5 shadow-sm">2</span>
 <span className="pt-1">You can begin messaging transactions like <b className="text-slate-900 font-medium">"swiggy 420 lunch"</b> or <b className="text-slate-900 font-medium">"ola 180 auto"</b>.</span>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs mt-0.5 shadow-sm">3</span>
 <span className="pt-1">The system pushes real-time web socket updates to this dashboard instantly.</span>
 </li>
 </ul>
 </div>
 </motion.div>

 {/* Deploy Checklist */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.3 }}
 className="md:col-span-5 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm relative overflow-hidden"
 >
 <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
 <div className="p-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg">
 <Terminal size={18} />
 </div>
 <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
 Bot Setup Roadmap
 </h3>
 </div>

 <p className="text-sm text-slate-600 leading-relaxed">
 Running your own bot is easy. Follow this list using our ready-made deployment script inside the project's <code className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">/backend</code> folder:
 </p>

 <div className="space-y-6 pt-2">
 <div className="flex gap-4 group">
 <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors group-hover:border-slate-300">
 1
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-semibold text-slate-900">Create Bot</h4>
 <p className="text-sm text-slate-500 leading-relaxed">
 Go to <b className="text-slate-700 font-medium">@BotFather</b> on Telegram, send <code className="bg-slate-100 text-slate-700 border border-slate-200 px-1 py-0.5 rounded text-xs font-mono">/newbot</code>, name it, and copy your API Token.
 </p>
 </div>
 </div>

 <div className="flex gap-4 group">
 <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors group-hover:border-slate-300">
 2
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-semibold text-slate-900">Fill Configuration</h4>
 <p className="text-sm text-slate-500 leading-relaxed">
 Open <code className="bg-slate-100 text-slate-700 border border-slate-200 px-1 py-0.5 rounded text-xs font-mono">backend/config.json</code> and paste your Telegram bot token, Supabase public anon keys, and Gemini secrets.
 </p>
 </div>
 </div>

 <div className="flex gap-4 group">
 <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors group-hover:border-slate-300">
 3
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-semibold text-slate-900">Boot Bot Process</h4>
 <p className="text-sm text-slate-500 leading-relaxed">
 Run <code className="bg-slate-100 text-slate-700 border border-slate-200 px-1 py-0.5 rounded text-xs font-mono">python bot.py</code> on your server (VPS, Railway, or local PC) to start receiving logs!
 </p>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 </motion.div>
 );
}
