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
  base_currency: string;
  target_weight: number | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  category: string; // Dynamic category names
  note: string;
  type: 'expense' | 'income';
  payment_method: string | null;
  merchant: string | null;
  is_subscription: boolean;
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
  ingredients: string[];
  cuisine: string | null;
  portion_size: string | null;
  is_home_cooked: boolean;
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
    currency?: string;
    category: string;
    note: string;
    type: 'expense' | 'income';
    payment_method?: string;
    merchant?: string;
    is_subscription?: boolean;
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
    ingredients?: string[];
    cuisine?: string;
    portion_size?: string;
    is_home_cooked?: boolean;
  };
  explanation: string;
}
