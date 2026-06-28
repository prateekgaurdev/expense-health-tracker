/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";

interface AuthPageProps {
  onBack: () => void;
  onAuthenticate: (params: {
    email?: string;
    password?: string;
    isSignUp?: boolean;
    name?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function AuthPage({ onBack, onAuthenticate }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await onAuthenticate({
        email,
        password,
        isSignUp,
        name: isSignUp ? name : undefined,
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
    <div className="min-h-screen bg-bg-app text-text-main flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-5/12 glass-panel border-r border-border-main p-12 flex-col justify-between relative overflow-hidden shrink-0 rounded-none h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--color-accent),transparent)] opacity-5 pointer-events-none"></div>
        
        {/* Top Header info */}
        <div className="relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono tracking-widest text-text-muted hover:text-accent transition cursor-pointer"
          >
            <ArrowLeft size={14} /> BACK TO HOMEPAGE
          </button>
        </div>

        {/* Feature Cards / Gimmicks */}
        <div className="space-y-8 my-auto max-w-sm relative z-10">
          <div className="space-y-2">
            <span className="text-accent font-display font-extrabold text-3xl tracking-tighter">
              ◢ Fin<span className="text-text-main">Track</span>
            </span>
            <p className="text-text-secondary text-sm mt-2 font-medium">Secure access to your personal finance and health tracker</p>
          </div>

          <h3 className="text-xl font-bold text-text-main leading-snug">
            Take control of your wealth and wellness today.
          </h3>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center gap-2.5 text-xs text-text-muted font-mono relative z-10">
          <ShieldCheck size={16} className="text-accent" />
          <span>Enterprise-Grade Security</span>
        </div>
      </div>

      {/* RIGHT PANEL: AUTH FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        {/* Floating controls for mobile */}
        <div className="absolute top-6 left-6 md:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-mono tracking-widest text-text-muted hover:text-accent transition cursor-pointer"
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
            <h2 className="text-2xl font-bold text-text-main tracking-tight font-display">Welcome Back</h2>
            <p className="text-text-muted text-sm mt-1">Authenticate to access your secure dashboard</p>
          </div>

          {/* Form Box */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex bg-bg-app border border-border-main p-1 rounded-lg max-w-max mx-auto mb-2">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`px-4 py-2 rounded text-[10px] font-mono font-bold uppercase transition ${
                  !isSignUp ? "bg-panel text-accent shadow-sm" : "text-text-muted hover:text-text-main"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`px-4 py-2 rounded text-[10px] font-mono font-bold uppercase transition ${
                  isSignUp ? "bg-panel text-accent shadow-sm" : "text-text-muted hover:text-text-main"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary font-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl px-4 py-3 text-sm font-mono transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary font-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary font-bold">
                  Secret Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm font-mono transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="text-rose-500 text-xs font-mono bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} /> {errorMsg}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 bg-accent hover:opacity-90 text-white font-extrabold py-3.5 rounded-xl transition-all text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 shadow-[0_4px_20px_var(--color-accent)] cursor-pointer"
                style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
              >
                {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Secure Login"} <ArrowRight size={15} />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
