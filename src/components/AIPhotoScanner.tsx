/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Utensils, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle 
} from "lucide-react";
import { Transaction, Meal } from "../types";

interface AIPhotoScannerProps {
  userId: string;
  onAddTransaction: (t: Transaction) => void;
  onAddMeal: (m: Meal) => void;
}

export default function AIPhotoScanner({
  userId,
  onAddTransaction,
  onAddMeal,
}: AIPhotoScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [scanType, setScanType] = useState<"auto" | "bill" | "meal">("auto");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [scannedResult, setScannedResult] = useState<{
    detected_type: "bill" | "meal";
    transaction?: {
      merchant: string;
      amount: number;
      date: string;
      category: string;
      note: string;
    };
    meal?: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      health_score: number;
      meal_type: "breakfast" | "lunch" | "dinner" | "snack";
    };
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setScannedResult(null);
    };
    reader.onerror = () => {
      setError("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleTriggerScan = async () => {
    if (!image) return;

    setScanning(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: image,
          type: scanType
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      }
      
      if (data.result) {
        setScannedResult(data.result);
      } else {
        setError("Failed to extract meaningful information from this photo.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to communicate with AI scanning endpoint. Please check your backend.");
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setScannedResult(null);
    setError(null);
  };

  const handleConfirmAdd = () => {
    if (!scannedResult) return;

    const todayStr = new Date().toISOString().split("T")[0];

    if (scannedResult.detected_type === "bill" && scannedResult.transaction) {
      const tx = scannedResult.transaction;
      const newTxn: Transaction = {
        id: `txn-photo-${Date.now()}`,
        user_id: userId,
        date: tx.date || todayStr,
        category: tx.category as any,
        amount: Number(tx.amount),
        note: `📸 [Receipt Scanned] ${tx.merchant} - ${tx.note}`,
        type: "expense",
        created_at: new Date().toISOString(),
      };
      onAddTransaction(newTxn);
    } else if (scannedResult.detected_type === "meal" && scannedResult.meal) {
      const ml = scannedResult.meal;
      const newMeal: Meal = {
        id: `meal-photo-${Date.now()}`,
        user_id: userId,
        date: todayStr,
        name: `📸 [Meal Scanned] ${ml.name}`,
        calories: Number(ml.calories),
        protein: Number(ml.protein),
        carbs: Number(ml.carbs),
        fat: Number(ml.fat),
        fiber: Number(ml.fiber),
        health_score: Number(ml.health_score),
        meal_type: ml.meal_type as any,
        created_at: new Date().toISOString(),
      };
      onAddMeal(newMeal);
    }

    handleReset();
  };

  return (
    <div id="ai_photo_scanner" className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="text-emerald-400 w-5 h-5 animate-pulse" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            AI Photo Scanner
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1">
          Powered by Gemini 3.5 Flash
        </span>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Upload or drop a picture of any bill/receipt to extract merchants and spending, or a picture of your food plate to estimate calories and macros instantly.
        </p>

        {/* Scan Type Picker */}
        {!image && (
          <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(["auto", "bill", "meal"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setScanType(type)}
                className={`flex-1 py-2 text-xs font-mono capitalize font-bold rounded-lg transition ${
                  scanType === type
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {type === "auto" ? "⚡ Auto Detect" : type === "bill" ? "🧾 Scan Bill" : "🥗 Scan Meal"}
              </button>
            ))}
          </div>
        )}

        {/* Upload Container / Preview */}
        {!image ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-emerald-500/40 bg-slate-950/40 hover:bg-slate-950/80 p-10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/20 mb-4 transition">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-mono font-bold text-slate-300 group-hover:text-white transition">
              Drag & Drop Photo or Click to Browse
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Supports PNG, JPG, JPEG, WEBP up to 20MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Image Preview */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <img
                src={image}
                alt="Upload Preview"
                className="max-h-full max-w-full object-contain"
              />
              
              {!scanning && !scannedResult && (
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 bg-slate-950/80 hover:bg-rose-950 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 text-slate-300 p-2 rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  Change Photo
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-950/30 border border-rose-900/30 text-rose-400 rounded-xl text-xs font-mono">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Scanning Button State */}
            {!scannedResult && !scanning && (
              <button
                onClick={handleTriggerScan}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Sparkles className="w-4 h-4 animate-bounce" /> Analyze Photo with AI
              </button>
            )}

            {scanning && (
              <div className="w-full bg-slate-950 border border-slate-800 py-4 px-4 rounded-xl text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                <p className="text-xs font-mono text-emerald-400 animate-pulse">
                  Gemini is examining details & estimating metrics...
                </p>
              </div>
            )}

            {/* Scanned Result Fields Editor Card */}
            {scannedResult && (
              <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-inner">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/50">
                  {scannedResult.detected_type === "bill" ? (
                    <FileText className="text-amber-400 w-4.5 h-4.5" />
                  ) : (
                    <Utensils className="text-cyan-400 w-4.5 h-4.5" />
                  )}
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    AI Extracted Results ({scannedResult.detected_type === "bill" ? "Bill Details" : "Meal Estimate"})
                  </h4>
                </div>

                {scannedResult.detected_type === "bill" && scannedResult.transaction ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono uppercase">Merchant</label>
                      <input
                        type="text"
                        value={scannedResult.transaction.merchant}
                        onChange={(e) => {
                          const updated = { ...scannedResult };
                          if (updated.transaction) updated.transaction.merchant = e.target.value;
                          setScannedResult(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono uppercase">Total Amount (₹)</label>
                      <input
                        type="number"
                        value={scannedResult.transaction.amount}
                        onChange={(e) => {
                          const updated = { ...scannedResult };
                          if (updated.transaction) updated.transaction.amount = Number(e.target.value);
                          setScannedResult(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono uppercase">Date</label>
                      <input
                        type="date"
                        value={scannedResult.transaction.date}
                        onChange={(e) => {
                          const updated = { ...scannedResult };
                          if (updated.transaction) updated.transaction.date = e.target.value;
                          setScannedResult(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono uppercase">Suggested Category</label>
                      <input
                        type="text"
                        value={scannedResult.transaction.category}
                        onChange={(e) => {
                          const updated = { ...scannedResult };
                          if (updated.transaction) updated.transaction.category = e.target.value;
                          setScannedResult(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono uppercase">Note Details</label>
                      <input
                        type="text"
                        value={scannedResult.transaction.note}
                        onChange={(e) => {
                          const updated = { ...scannedResult };
                          if (updated.transaction) updated.transaction.note = e.target.value;
                          setScannedResult(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : scannedResult.detected_type === "meal" && scannedResult.meal ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-[10px] text-slate-500 font-mono uppercase">Meal Dish Name</label>
                        <input
                          type="text"
                          value={scannedResult.meal.name}
                          onChange={(e) => {
                            const updated = { ...scannedResult };
                            if (updated.meal) updated.meal.name = e.target.value;
                            setScannedResult(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono uppercase">Estimated Calories (kcal)</label>
                        <input
                          type="number"
                          value={scannedResult.meal.calories}
                          onChange={(e) => {
                            const updated = { ...scannedResult };
                            if (updated.meal) updated.meal.calories = Number(e.target.value);
                            setScannedResult(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono uppercase">Protein (g)</label>
                        <input
                          type="number"
                          value={scannedResult.meal.protein}
                          onChange={(e) => {
                            const updated = { ...scannedResult };
                            if (updated.meal) updated.meal.protein = Number(e.target.value);
                            setScannedResult(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono uppercase">Carbohydrates (g)</label>
                        <input
                          type="number"
                          value={scannedResult.meal.carbs}
                          onChange={(e) => {
                            const updated = { ...scannedResult };
                            if (updated.meal) updated.meal.carbs = Number(e.target.value);
                            setScannedResult(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono uppercase">Fat (g)</label>
                        <input
                          type="number"
                          value={scannedResult.meal.fat}
                          onChange={(e) => {
                            const updated = { ...scannedResult };
                            if (updated.meal) updated.meal.fat = Number(e.target.value);
                            setScannedResult(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono uppercase">Health Score (1 to 10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={scannedResult.meal.health_score}
                          onChange={(e) => {
                            const updated = { ...scannedResult };
                            if (updated.meal) updated.meal.health_score = Number(e.target.value);
                            setScannedResult(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono uppercase">Meal Type</label>
                        <select
                          value={scannedResult.meal.meal_type}
                          onChange={(e) => {
                            const updated = { ...scannedResult };
                            if (updated.meal) updated.meal.meal_type = e.target.value as any;
                            setScannedResult(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        >
                          {["breakfast", "lunch", "dinner", "snack"].map((mType) => (
                            <option key={mType} value={mType}>{mType}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Confirm buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} /> Reset scanner
                  </button>
                  <button
                    onClick={handleConfirmAdd}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                  >
                    <PlusCircle size={14} /> Confirm & Log Item
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
