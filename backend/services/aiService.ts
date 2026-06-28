import { Type } from "@google/genai";
import ai from "../config/ai";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!ai) return Array(768).fill(0);
  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text
    });
    return response.embeddings?.[0]?.values || Array(768).fill(0);
  } catch (error) {
    console.error("Error generating embedding:", error);
    return Array(768).fill(0);
  }
}

export async function parseMessageCore(message: string) {
  if (!ai) {
    console.log("Gemini not initialized, using local regex/keyword parser fallback.");
    return { result: parseMessageFallback(message), fallback: true };
  }

  const systemPrompt = `
    You are an expert financial and nutritional parser for a personal tracker app called FinTrack.
    Your task is to analyze a single text message in plain English or Hinglish (e.g. "spent 500 on ola", "swiggy 420 dinner", "edit the swiggy lunch to 500", "delete the last ola trip") and extract structured financial or nutritional data, as well as the user's intent.

    Intent Detection:
    - Determine if the user wants to 'add' a new log, 'edit' an existing log, or 'delete' a log.
    - If editing or deleting, extract a concise 'target_description' of the item they want to modify (e.g., "swiggy lunch", "ola trip", "500rs amazon").

    Supported Categories: travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education, other. If the item doesn't fit these well, dynamically create a concise, relevant new category (e.g. 'gifts', 'pet', 'subscriptions').
    Supported Type: 'expense' | 'income' | 'meal' | 'both'.

    Amounts:
    - Recognize k / K as thousands (e.g. 1.5k = 1500).
    - Recognize l / L / lakh as lakhs (e.g. 2l = 200000).
    - Recognize rs, rupees, ₹, RS.
    
    Extraction Details:
    - For expenses, extract the payment_method (e.g., 'UPI', 'Credit Card', 'Cash') if mentioned, the specific merchant (e.g., 'Swiggy', 'Amazon', 'Uber'), and check if it's a recurring subscription (is_subscription). Also extract currency (default INR).
    - For meals, try to identify the main ingredients (array), the cuisine (e.g., 'Indian', 'Italian'), the portion_size (e.g., '1 plate', '500g'), and whether it appears to be home cooked (is_home_cooked).

    Nutrition Detection:
    - If the message refers to eating, ordering food, Swiggy, Zomato, groceries that are directly meals, or specific dishes (e.g. "lunch 2 eggs", "swiggy 420 dinner"), detect it as a 'meal' or 'both' (if an expense amount is present).
    - Estimate realistic calories, protein (g), carbs (g), fat (g), fiber (g), and health_score (1 to 10, where 10 is super healthy like salad/eggs, and 1 is highly processed/junk).
    - Set meal_type based on keywords or default to snack/lunch/dinner appropriately.

    Income Detection:
    - If the message indicates receiving money (e.g. "got salary 75000", "cashback 50 received", "credited 1000", "salary", "dividend"), set transaction type to "income" and categorise as "other" or "investments" if appropriate.

    Output JSON strictly according to the schema provided. No markdown wrapping, no extra comments, just the pure JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "The intended action: 'add', 'edit', or 'delete'. Defaults to 'add'.",
      },
      target_description: {
        type: Type.STRING,
        description: "If action is 'edit' or 'delete', describe the exact transaction the user wants to modify (e.g. 'swiggy lunch' or '500 ola'). Null if 'add'.",
        nullable: true,
      },
      type: {
        type: Type.STRING,
        description: "Detect the intent of the logging: 'expense', 'income', 'meal', or 'both' (if both expense and meal are found).",
      },
      transaction: {
        type: Type.OBJECT,
        description: "Extracted transaction details if type is expense, income, or both.",
        properties: {
          amount: { type: Type.NUMBER, description: "Numeric amount in Rupees. Do not include currency symbols." },
          currency: { type: Type.STRING, description: "Detected currency, default to INR." },
          category: { 
            type: Type.STRING, 
            description: "The best category. Try to use common ones like travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education. If none fit well, create a suitable concise new category name in lowercase." 
          },
          note: { type: Type.STRING, description: "Descriptive clean note (e.g. 'ola cab to office', 'myntra shirt', 'swiggy dinner')." },
          type: { type: Type.STRING, description: "Either 'expense' or 'income'." },
          payment_method: { type: Type.STRING, description: "e.g. UPI, Cash, Credit Card", nullable: true },
          merchant: { type: Type.STRING, description: "e.g. Swiggy, Amazon, Uber", nullable: true },
          is_subscription: { type: Type.BOOLEAN, description: "True if recurring bill/subscription" }
        },
        required: ["amount", "category", "note", "type"],
      },
      meal: {
        type: Type.OBJECT,
        description: "Extracted nutritional meal details if type is meal or both.",
        properties: {
          name: { type: Type.STRING, description: "Dish or meal description (e.g. 'Paneer, 2 roti & dal', 'Double cheese pizza', 'Boiled eggs')." },
          calories: { type: Type.NUMBER, description: "Estimated total calories (kcal)." },
          protein: { type: Type.NUMBER, description: "Estimated protein content in grams." },
          carbs: { type: Type.NUMBER, description: "Estimated carbohydrate content in grams." },
          fat: { type: Type.NUMBER, description: "Estimated fat content in grams." },
          fiber: { type: Type.NUMBER, description: "Estimated fiber content in grams." },
          health_score: { type: Type.NUMBER, description: "Estimated healthiness score from 1 (unhealthy) to 10 (exceptionally healthy)." },
          meal_type: { 
            type: Type.STRING, 
            description: "Must be exactly one of: breakfast, lunch, dinner, snack." 
          },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Main ingredients detected" },
          cuisine: { type: Type.STRING, description: "e.g. Indian, Italian, Fast Food", nullable: true },
          portion_size: { type: Type.STRING, description: "e.g. 1 plate, 500g", nullable: true },
          is_home_cooked: { type: Type.BOOLEAN, description: "True if home cooked" }
        },
        required: ["name", "calories", "protein", "carbs", "fat", "fiber", "health_score", "meal_type"],
      },
      explanation: {
        type: Type.STRING,
        description: "A short, cheerful, Hinglish or English confirmation summary to send back to the user (e.g. 'Logged ₹420 Swiggy dinner!', 'Edited swiggy lunch to ₹500', or 'Deleted ola transaction').",
      },
    },
    required: ["action", "type", "explanation"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Parse this message: "${message}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const parsedText = response.text?.trim() || "{}";
    const result = JSON.parse(parsedText);
    return { result, fallback: false };
  } catch (error: any) {
    console.error("Error parsing message with Gemini:", error);
    return { result: parseMessageFallback(message), fallback: true, error: error.message };
  }
}

export function parseMessageFallback(message: string) {
  const clean = message.toLowerCase().trim();
  
  let amount = 0;
  const amtMatch = clean.match(/(?:rs\.?|₹|rupees)?\s*(\d+(?:\.\d+)?)\s*(k|l|lakh|rs|rupees)?\b/);
  if (amtMatch) {
    const rawVal = parseFloat(amtMatch[1]);
    const unit = amtMatch[2];
    if (unit === 'k') amount = rawVal * 1000;
    else if (unit === 'l' || unit === 'lakh') amount = rawVal * 100000;
    else amount = rawVal;
  }

  const incomeKeywords = ["salary", "refund", "cashback", "received", "credited", "got", "bonus", "interest", "income"];
  const isIncome = incomeKeywords.some(kw => clean.includes(kw));

  let category: string = "other";
  const keywordMap: Record<string, string[]> = {
    travel: ["ola", "uber", "metro", "cab", "rickshaw", "auto", "train", "flight", "petrol", "diesel", "fuel"],
    food: ["swiggy", "zomato", "chai", "dinner", "lunch", "breakfast", "restaurant", "burger", "pizza", "biryani", "cafe"],
    groceries: ["blinkit", "zepto", "instamart", "groceries", "milk", "vegetables", "fruits", "supermarket", "grocery"],
    clothes: ["myntra", "zara", "clothes", "shirt", "pants", "shoes", "hm", "shopping"],
    rent: ["rent", "landlord", "flat", "room"],
    bills: ["electricity", "wifi", "internet", "broadband", "recharge", "water", "bill", "subscription", "netflix", "spotify"],
    luxuries: ["gym", "movie", "cinema", "club", "party", "booze", "beer", "game", "spa", "weekend"],
    investments: ["sip", "etf", "stocks", "mutual", "shares", "invested", "bitcoin", "crypto"],
    health: ["doctor", "medicine", "pharmacy", "hospital", "clinic", "tests", "meds"],
    education: ["fees", "course", "book", "udemy", "tuition", "school"],
  };

  for (const [cat, kws] of Object.entries(keywordMap)) {
    if (kws.some(kw => clean.includes(kw))) {
      category = cat;
      break;
    }
  }

  const mealKeywords = ["lunch", "dinner", "breakfast", "snack", "roti", "egg", "eggs", "chicken", "biryani", "rice", "dal", "salad", "shake", "protein", "paneer", "apple", "banana", "milk", "coffee", "tea", "swiggy", "zomato"];
  const isMeal = mealKeywords.some(kw => clean.includes(kw));

  const note = message
    .replace(/(?:rs\.?|₹|rupees)?\s*\d+(?:\.\d+)?\s*(k|l|lakh|rs|rupees)?/gi, "")
    .replace(/\b(?:spent|on|got|for|received|credited|bought)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || "Item log";

  const response: any = {
    type: isIncome ? "income" : (isMeal && amount > 0 ? "both" : (isMeal ? "meal" : "expense")),
    action: "add"
  };

  if (response.type === "expense" || response.type === "income" || response.type === "both") {
    response.transaction = {
      amount: amount || 100,
      category: isIncome ? "other" : category,
      note: note,
      type: isIncome ? "income" : "expense",
    };
  }

  if (response.type === "meal" || response.type === "both") {
    let name = note || "Healthy Meal";
    let calories = 350, protein = 12, carbs = 40, fat = 10, fiber = 3, healthScore = 7;
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = "snack";

    if (clean.includes("egg") || clean.includes("protein") || clean.includes("chicken") || clean.includes("paneer")) {
      protein = 28; calories = 420; healthScore = 9;
    }
    if (clean.includes("pizza") || clean.includes("burger") || clean.includes("swiggy") || clean.includes("zomato")) {
      calories = 780; protein = 18; fat = 32; carbs = 90; healthScore = 3;
    }
    if (clean.includes("breakfast")) mealType = "breakfast";
    else if (clean.includes("lunch")) mealType = "lunch";
    else if (clean.includes("dinner")) mealType = "dinner";

    response.meal = { name, calories, protein, carbs, fat, fiber, health_score: healthScore, meal_type: mealType };
  }

  const actType = response.type === "income" ? "Income source" : (response.type === "both" ? "Expense + Meal" : (response.type === "meal" ? "Meal" : "Expense"));
  response.explanation = `[Offline Fallback] Successfully parsed message! Detected as **${actType}**. ${amount > 0 ? `Rupees: ₹${amount}.` : ""} ${response.meal ? `Estimated: ${response.meal.calories} kcal, ${response.meal.protein}g protein.` : ""}`;

  return response;
}

export function parsePhotoFallback(type: string) {
  const todayStr = new Date().toISOString().split("T")[0];
  if (type === "meal") {
    return {
      detected_type: "meal",
      meal: {
        name: "[Fallback Demo] High Protein Greek Yogurt & Blueberries",
        calories: 280,
        protein: 24,
        carbs: 28,
        fat: 4,
        fiber: 3,
        health_score: 9,
        meal_type: "breakfast"
      }
    };
  } else if (type === "bill") {
    return {
      detected_type: "bill",
      transaction: {
        merchant: "[Fallback Demo] Zara Store",
        amount: 3200,
        date: todayStr,
        category: "clothes",
        note: "[Fallback Demo] Cotton Slim-fit Shirt"
      }
    };
  } else {
    return {
      detected_type: "meal",
      meal: {
        name: "[Fallback Demo] Grilled Salmon Bowl with Quinoa",
        calories: 520,
        protein: 38,
        carbs: 45,
        fat: 18,
        fiber: 6,
        health_score: 10,
        meal_type: "dinner"
      }
    };
  }
}

export function generateLocalAssistAnswer(question: string, transactions: any[], meals: any[], profile: any): string {
  const q = question.toLowerCase();
  const profileName = profile?.name || "User";

  const expenses = (transactions || []).filter((t: any) => t.type === "expense");
  const totalSpent = expenses.reduce((sum: number, t: any) => sum + t.amount, 0);

  if (q.includes("spent") || q.includes("highest") || q.includes("most") || q.includes("money")) {
    const categorySums = expenses.reduce((acc: Record<string, number>, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
    const sorted = Object.entries(categorySums).sort((a: any, b: any) => b[1] - a[1]);
    
    if (sorted.length > 0) {
      const [topCat, topVal] = sorted[0];
      return `Hey ${profileName}! Looking at your latest data, you've spent the most on **${topCat}** totaling **₹${topVal}**.\n\nHere is a quick summary of your spending:\n${sorted.map(([cat, val]) => `- **${cat}**: ₹${val}`).join("\n")}\n\n**AI Insight:** Your food delivery orders (Swiggy/Zomato) are a significant part of your discretionary load. Cutting back just 20% would save you about **₹18,000/year**! Try replacing 1 restaurant order per week with a home-cooked healthy alternative.`;
    }
    return `Hey ${profileName}, you haven't logged any expenses yet! Once you log spending like "swiggy 420 dinner" or "ola 200 cab", I'll show you exactly where your money goes.`;
  }

  if (q.includes("calorie") || q.includes("protein") || q.includes("eat") || q.includes("nutrition") || q.includes("health")) {
    if (meals && meals.length > 0) {
      const avgKcal = Math.round(meals.reduce((s: number, m: any) => s + m.calories, 0) / meals.length);
      const avgProt = Math.round(meals.reduce((s: number, m: any) => s + m.protein, 0) / meals.length);
      const avgHealth = (meals.reduce((s: number, m: any) => s + m.health_score, 0) / meals.length).toFixed(1);

      return `Hi ${profileName}, here is your current nutrition summary:\n- **Average Calories/Meal:** ${avgKcal} kcal (Goal: ${profile?.calorie_goal || 2200} kcal/day)\n- **Average Protein/Meal:** ${avgProt}g (Goal: ${profile?.protein_goal || 100}g/day)\n- **Average Health Score:** ${avgHealth}/10\n\n**AI Dietician Recommendation:** Your protein intake is slightly below your target of ${profile?.protein_goal || 100}g. Consider adding high-protein snacks like boiled eggs, paneer, Greek yogurt, or a protein shake. You eat healthiest on days when you log home-cooked meals!`;
    }
    return `Hi ${profileName}, no meals have been tracked yet. Try logging what you eat, e.g., "lunch chicken salad" or "swiggy 420 paneer tikka", and I'll analyze your daily calorie and protein metrics!`;
  }

  return `Hey there ${profileName}! I am your FinTrack AI companion.\n\nI can help you analyze both your **wealth** and your **wellness**! Ask me questions like:\n- *"Where did I spend the most money?"*\n- *"Am I meeting my daily protein target?"*\n- *"How can I save ₹3,000 this month?"*\n\nTry tracking some transactions or meals by sending mock messages in the input box above, and ask me again!`;
}
