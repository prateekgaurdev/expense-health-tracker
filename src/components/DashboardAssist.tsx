/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
 Bot, 
 Send, 
 Sparkles, 
 User, 
} from "lucide-react";
import { ChatMessage, Transaction, Meal, Profile } from "../types";

interface DashboardAssistProps {
 profile: Profile;
 transactions: Transaction[];
 meals: Meal[];
}

export default function DashboardAssist({
 profile,
 transactions,
 meals,
}: DashboardAssistProps) {
 const [messages, setMessages] = useState<ChatMessage[]>([
 {
 id: "welcome",
 role: "model",
 content: `Hey ${profile.name}! I am FinTrack AI, your personal finance and nutrition assistant.

I analyze your spending patterns, budget caps, and daily calorie/protein intake in real-time to help you optimize both your wealth and wellness.

How can I help you today? You can try clicking one of the suggestion chips below!`,
 created_at: new Date().toISOString(),
 },
 ]);
 const [input, setInput] = useState("");
 const [loading, setLoading] = useState(false);
 const chatEndRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, loading]);

 const handleSendMessage = async (customText?: string) => {
 const textToSend = customText || input;
 if (!textToSend.trim()) return;

 const userMsg: ChatMessage = {
 id: `user-${Date.now()}`,
 role: "user",
 content: textToSend,
 created_at: new Date().toISOString(),
 };

 setMessages((prev) => [...prev, userMsg]);
 setInput("");
 setLoading(true);

 try {
 const res = await fetch("/api/ai-assist", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 question: textToSend,
 transactions,
 meals,
 profile,
 chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
 }),
 });
 const data = await res.json();

 const aiMsg: ChatMessage = {
 id: `ai-${Date.now()}`,
 role: "model",
 content: data.answer || "⚠️ No response received from server. Check your connection.",
 created_at: new Date().toISOString(),
 };

 setMessages((prev) => [...prev, aiMsg]);
 } catch (err) {
 console.error(err);
 const errMsg: ChatMessage = {
 id: `ai-err-${Date.now()}`,
 role: "model",
 content: "⚠️ Failed to reach server assist endpoint. Try checking if your server is running or configure closer keys.",
 created_at: new Date().toISOString(),
 };
 setMessages((prev) => [...prev, errMsg]);
 } finally {
 setLoading(false);
 }
 };

 const suggestions = [
 "Where did I spend the most money?",
 "Am I hitting my daily protein target?",
 "How can I save ₹3,000 this month?",
 "Give me a wellness and meal health analysis",
 ];

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="flex flex-col h-[calc(100vh-170px)] glass-panel border border-border-main rounded-2xl overflow-hidden shadow-sm font-sans relative max-w-5xl mx-auto w-full">

 {/* Chat header */}
 <div className="glass-panel border-b border-border-subtle px-6 py-4 flex items-center justify-between relative z-10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
 <Bot size={20} />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
 FinTrack AI Companion
 </h3>
 <p className="text-xs text-text-muted">
 Grounded in {transactions.length} spending logs & {meals.length} nutrition logs
 </p>
 </div>
 </div>
 <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
 <Sparkles size={14} className="text-emerald-500" /> Active
 </div>
 </div>

 {/* Chat Message Logs Area */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-border-subtle/50 relative z-10">
 {messages.map((m) => {
 const isAI = m.role === "model";
 return (
 <div
 key={m.id}
 className={`flex items-start gap-3.5 ${!isAI ? "flex-row-reverse" : "justify-start"}`}
 >
 {/* Avatar */}
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
 isAI 
 ? "bg-blue-100 text-accent" 
 : "bg-slate-200 text-text-secondary"
 }`}>
 {isAI ? <Bot size={16} /> : <User size={16} />}
 </div>

 {/* Bubble content */}
 <div className={`max-w-[75%] p-4 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
 isAI 
 ? "glass-panel border border-border-main text-text-main rounded-2xl rounded-tl-sm" 
 : "bg-blue-600 text-white font-medium rounded-2xl rounded-tr-sm"
 }`}>
 {m.content}
 </div>
 </div>
 );
 })}

 {/* Typing spinner */}
 {loading && (
 <div className="flex items-start gap-3.5 justify-start">
 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-accent animate-spin shrink-0">
 <Bot size={16} />
 </div>
 <div className="glass-panel border border-border-main rounded-2xl rounded-tl-sm px-5 py-3.5 text-sm text-text-muted animate-pulse shadow-sm">
 FinTrack AI is thinking and compiling your metrics...
 </div>
 </div>
 )}
 <div ref={chatEndRef} />
 </div>

 {/* Suggestion Chips */}
 <div className="px-6 py-3 glass-panel border-t border-border-subtle flex flex-wrap gap-2 relative z-10 overflow-x-auto whitespace-nowrap">
 {suggestions.map((s) => (
 <button
 key={s}
 onClick={() => handleSendMessage(s)}
 disabled={loading}
 className="text-xs font-medium bg-border-subtle hover:bg-border-subtle border border-border-main text-text-secondary hover:text-text-main px-3 py-2 rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
 >
 {s}
 </button>
 ))}
 </div>

 {/* Input box */}
 <div className="p-4 glass-panel border-t border-border-subtle flex gap-3 relative z-10">
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && input.trim()) handleSendMessage();
 }}
 placeholder="Ask about your budget, protein goals, or dining cost-efficiencies..."
 disabled={loading}
 className="flex-1 bg-border-subtle border border-border-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none placeholder-slate-400 transition-all shadow-sm"
 />
 <button
 onClick={() => handleSendMessage()}
 disabled={loading || !input.trim()}
 className="bg-blue-600 hover:bg-blue-700 disabled:bg-border-subtle disabled:text-text-muted disabled:border-border-main text-white px-6 rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
 >
 Send <Send size={16} />
 </button>
 </div>
 </motion.div>
 );
}
