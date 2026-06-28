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
 className="w-full text-text-main font-sans max-w-7xl mx-auto"
 >
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl font-semibold tracking-tight text-text-main mb-1">Integrations</h1>
 <p className="text-text-muted text-sm">Connect external platforms to log data instantly.</p>
 </div>
 </div>
 
 <div className="space-y-8">
 {/* CONNECTION STATUS BANNER */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="glass-panel border border-border-main p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

 <div className="space-y-3 relative z-10">
 <div className="flex items-center gap-2">
 <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
 <MessageSquare size={16} />
 </div>
 <p className="text-xs font-semibold text-accent uppercase tracking-wider">Telegram Bot</p>
 </div>
 <h2 className="text-2xl font-semibold text-text-main tracking-tight">
 Connect Telegram to Your Account
 </h2>
 <p className="text-sm text-text-muted max-w-xl leading-relaxed">
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
 className="md:col-span-7 glass-panel border border-border-main p-6 sm:p-8 rounded-2xl space-y-8 shadow-sm relative overflow-hidden"
 >
 <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
 <div className="p-2 bg-border-subtle text-text-secondary border border-border-main rounded-lg">
 <Link size={18} />
 </div>
 <h3 className="text-lg font-semibold text-text-main tracking-tight">
 Connecting in 1 Step
 </h3>
 </div>

 <div className="space-y-4">
 <p className="text-sm text-text-secondary leading-relaxed">
 Copy this command and send it directly to your Telegram bot. This pairs your Telegram chat account to this secure web dashboard session.
 </p>

 <div className="bg-border-subtle border border-border-main rounded-xl p-6 flex flex-col gap-4">
  <div className="space-y-1">
   <span className="text-xs font-medium text-text-muted uppercase tracking-wider">BotFather Access Token</span>
   <input
    type="text"
    placeholder="e.g. 123456789:ABCdefGHIjklmNoPQRstUVwxyZ"
    id="bot-token-input"
    className="w-full glass-panel border border-border-main rounded-xl px-4 py-3 text-sm text-text-main focus:border-blue-500 focus:outline-none font-mono shadow-sm mt-1"
   />
  </div>

  <button
   onClick={async () => {
     try {
       const token = (document.getElementById('bot-token-input') as HTMLInputElement).value;
       if (!token) return alert('Please enter a bot token');
       
       const res = await fetch('/api/save-bot-token', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId: profile.id, botToken: token })
       });
       
       const textResponse = await res.text();
       let data;
       try {
         data = JSON.parse(textResponse);
       } catch (e) {
         throw new Error("Server returned an invalid response (not JSON). It may be down or unreachable.");
       }

       if (data.success) {
         alert('Bot linked successfully! You can now message your bot.');
         window.location.reload();
       } else {
         alert(data.error || 'Failed to link bot');
       }
     } catch (err: any) {
       console.error(err);
       alert("An error occurred: " + err.message);
     }
   }}
   className="w-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium cursor-pointer shadow-sm hover:shadow active:scale-95"
  >
   <Link size={16} /> Link My Bot
  </button>
 </div>
 </div>

 <div className="space-y-4 pt-4">
 <h4 className="text-sm font-semibold text-text-main tracking-tight">What happens next:</h4>
 <ul className="space-y-4 text-sm text-text-secondary">
 <li className="flex items-start gap-4">
 <span className="flex-shrink-0 w-7 h-7 rounded-full bg-border-subtle border border-border-main text-text-secondary flex items-center justify-center font-medium text-xs mt-0.5 shadow-sm">1</span>
 <span className="pt-1">Go to Telegram and message your newly created bot with <b className="text-text-main font-medium">/link</b>.</span>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex-shrink-0 w-7 h-7 rounded-full bg-border-subtle border border-border-main text-text-secondary flex items-center justify-center font-medium text-xs mt-0.5 shadow-sm">2</span>
 <span className="pt-1">The bot will respond confirming the connection.</span>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex-shrink-0 w-7 h-7 rounded-full bg-border-subtle border border-border-main text-text-secondary flex items-center justify-center font-medium text-xs mt-0.5 shadow-sm">3</span>
 <span className="pt-1">You can begin messaging transactions like <b className="text-text-main font-medium">"swiggy 420 lunch"</b> or <b className="text-text-main font-medium">"ola 180 auto"</b>.</span>
 </li>
 </ul>
 </div>
 </motion.div>

 {/* Deploy Checklist */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.3 }}
 className="md:col-span-5 glass-panel border border-border-main p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm relative overflow-hidden"
 >
 <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
 <div className="p-2 bg-border-subtle text-text-secondary border border-border-main rounded-lg">
 <Terminal size={18} />
 </div>
 <h3 className="text-lg font-semibold text-text-main tracking-tight">
 Bot Setup Roadmap
 </h3>
 </div>

 <p className="text-sm text-text-secondary leading-relaxed">
 Just follow these simple steps to bring your own personal FinTrack bot to life:
 </p>

 <div className="space-y-6 pt-2">
 <div className="flex gap-4 group">
 <div className="w-8 h-8 rounded-lg bg-border-subtle border border-border-main text-sm font-semibold text-text-secondary flex items-center justify-center flex-shrink-0 shadow-sm transition-colors group-hover:border-slate-300">
 1
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-semibold text-text-main">Create Bot</h4>
 <p className="text-sm text-text-muted leading-relaxed">
 Go to <b className="text-text-secondary font-medium">@BotFather</b> on Telegram and send <code className="bg-border-subtle text-text-secondary border border-border-main px-1 py-0.5 rounded text-xs font-mono">/newbot</code>.
 </p>
 </div>
 </div>

 <div className="flex gap-4 group">
 <div className="w-8 h-8 rounded-lg bg-border-subtle border border-border-main text-sm font-semibold text-text-secondary flex items-center justify-center flex-shrink-0 shadow-sm transition-colors group-hover:border-slate-300">
 2
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-semibold text-text-main">Copy Token</h4>
 <p className="text-sm text-text-muted leading-relaxed">
 After naming your bot, BotFather will give you a long API Token (e.g. `1234:ABC...`). Copy it.
 </p>
 </div>
 </div>

 <div className="flex gap-4 group">
 <div className="w-8 h-8 rounded-lg bg-border-subtle border border-border-main text-sm font-semibold text-text-secondary flex items-center justify-center flex-shrink-0 shadow-sm transition-colors group-hover:border-slate-300">
 3
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-semibold text-text-main">Link Here</h4>
 <p className="text-sm text-text-muted leading-relaxed">
 Paste that token into the input field on the left and click "Link My Bot". We will automatically register it for you!
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
