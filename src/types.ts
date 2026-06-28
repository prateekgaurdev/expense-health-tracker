/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string;
  email: string;
  name: string;
  telegram_chat_id: string | null;
  link_code: string | null;
  monthly_budget: number;
  calorie_goal: number;
  protein_goal: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  category: string; // Dynamic category names
  amount: number;
  note: string;
  type: 'expense' | 'income';
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
  health_score: number; // 1 to 10
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface ParsedItem {
  type: 'expense' | 'income' | 'meal' | 'both';
  transaction?: {
    amount: number;
    category: string;
    note: string;
    type: 'expense' | 'income';
  };
  meal?: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    health_score: number;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  };
  explanation?: string;
}
