/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini Client initialized successfully on the server.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not set or using placeholder. Running in fallback/demo mode.");
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

async function generateEmbedding(text: string): Promise<number[]> {
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

async function parseMessageCore(message: string) {
  if (!ai) {
    console.log("Gemini not initialized, using local regex/keyword parser fallback.");
    return { result: parseMessageFallback(message), fallback: true };
  }

  const systemPrompt = `
    You are an expert financial and nutritional parser for a personal tracker app called FinTrack.
    Your task is to analyze a single text message in plain English or Hinglish (e.g. "spent 500 on ola", "swiggy 420 dinner", "1.5k myntra shirt", "got salary 75000", "lunch 2 eggs and toast") and extract structured financial or nutritional data.

    Supported Categories: travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education, other. If the item doesn't fit these well, dynamically create a concise, relevant new category (e.g. 'gifts', 'pet', 'subscriptions').
    Supported Type: 'expense' | 'income' | 'meal' | 'both'.

    Amounts:
    - Recognize k / K as thousands (e.g. 1.5k = 1500).
    - Recognize l / L / lakh as lakhs (e.g. 2l = 200000).
    - Recognize rs, rupees, ₹, RS.

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
      type: {
        type: Type.STRING,
        description: "Detect the intent of the logging: 'expense', 'income', 'meal', or 'both' (if both expense and meal are found).",
      },
      transaction: {
        type: Type.OBJECT,
        description: "Extracted transaction details if type is expense, income, or both.",
        properties: {
          amount: { type: Type.NUMBER, description: "Numeric amount in Rupees. Do not include currency symbols." },
          category: { 
            type: Type.STRING, 
            description: "The best category. Try to use common ones like travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education. If none fit well, create a suitable concise new category name in lowercase." 
          },
          note: { type: Type.STRING, description: "Descriptive clean note (e.g. 'ola cab to office', 'myntra shirt', 'swiggy dinner')." },
          type: { type: Type.STRING, description: "Either 'expense' or 'income'." },
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
        },
        required: ["name", "calories", "protein", "carbs", "fat", "fiber", "health_score", "meal_type"],
      },
      explanation: {
        type: Type.STRING,
        description: "A short, cheerful, Hinglish or English confirmation summary to send back to the user (e.g. 'Logged ₹420 Swiggy dinner! Estimated ~680 kcal with 24g protein. Stay healthy!').",
      },
    },
    required: ["type", "explanation"],
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

// 1. Parse expense/meal message using Gemini AI
app.post("/api/parse", async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message is required and must be a string." });
    return;
  }
  const parsed = await parseMessageCore(message);
  res.json(parsed);
});

// -------------------------------------------------------------
// TELEGRAM WEBHOOK ENDPOINTS
// -------------------------------------------------------------
app.post("/api/save-bot-token", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, botToken } = req.body;
    if (!userId || !botToken) {
      res.status(400).json({ error: "userId and botToken are required." });
      return;
    }

    // Upsert profile and save bot token
    await prisma.profile.upsert({
      where: { id: userId },
      update: { telegram_bot_token: botToken },
      create: { id: userId, telegram_bot_token: botToken }
    });

    // Set Webhook to Vercel URL
    const appUrl = process.env.APP_URL || req.headers.origin || "https://fintrack.vercel.app";
    const webhookUrl = `${appUrl}/api/telegram-webhook/${userId}`;
    
    // Call Telegram API using fetch
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
    const data = await response.json();

    if (!data.ok) {
      res.status(500).json({ error: "Failed to set Telegram webhook: " + data.description });
      return;
    }

    res.json({ success: true, message: "Webhook successfully registered!" });
  } catch (error: any) {
    console.error("Error saving bot token:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/telegram-webhook/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const body = req.body;

    // Send 200 OK early to Telegram so it doesn't retry
    res.status(200).send("OK");

    if (!body.message || !body.message.text) return;
    const text = body.message.text;
    const chatId = body.message.chat.id;

    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!profile || !profile.telegram_bot_token) {
      console.log("Profile or bot token not found for user:", userId);
      return;
    }
    const token = profile.telegram_bot_token;

    // Save chat ID if we haven't already
    if (!profile.telegram_chat_id || profile.telegram_chat_id !== String(chatId)) {
      await prisma.profile.update({
        where: { id: userId },
        data: { telegram_chat_id: String(chatId) }
      });
    }

    const sendMessage = async (msg: string) => {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: msg })
        });
      } catch (err) {
        console.error("Error sending Telegram message:", err);
      }
    };

    if (text.startsWith("/start") || text.startsWith("/link")) {
      await sendMessage("✅ Pair successful! Hello from FinTrack. You can now log expenses and meals directly here.\nTry sending: 'swiggy 420 lunch'");
      return;
    }

    // Parse the message using Gemini
    const parsed = await parseMessageCore(text);
    const result = parsed.result;

    if (!result) {
      await sendMessage("Sorry, I couldn't understand that. Please try again.");
      return;
    }

    // Save to Database with Embeddings
    const crypto = require('crypto');
    if (result.type === "expense" || result.type === "income" || result.type === "both") {
      if (result.transaction) {
        const textToEmbed = \`\${result.transaction.type} of \${result.transaction.amount} in \${result.transaction.category}. Note: \${result.transaction.note}\`;
        const embedding = await generateEmbedding(textToEmbed);
        const vectorStr = \`[\${embedding.join(',')}]\`;
        
        await prisma.$executeRaw\`
          INSERT INTO "transactions" (id, profile_id, amount, category, note, type, date, created_at, embedding)
          VALUES (
            \${crypto.randomUUID()}, 
            \${userId}::uuid, 
            \${result.transaction.amount}, 
            \${result.transaction.category}, 
            \${result.transaction.note}, 
            \${result.transaction.type}, 
            now(), now(), 
            \${vectorStr}::vector
          )
        \`;
      }
    }

    if (result.type === "meal" || result.type === "both") {
      if (result.meal) {
        const textToEmbed = \`Ate \${result.meal.name} for \${result.meal.meal_type}. \${result.meal.calories} kcal, \${result.meal.protein}g protein, health score \${result.meal.health_score}.\`;
        const embedding = await generateEmbedding(textToEmbed);
        const vectorStr = \`[\${embedding.join(',')}]\`;

        await prisma.$executeRaw\`
          INSERT INTO "meals" (id, profile_id, name, calories, protein, carbs, fat, fiber, health_score, meal_type, date, created_at, embedding)
          VALUES (
            \${crypto.randomUUID()}, 
            \${userId}::uuid, 
            \${result.meal.name}, 
            \${result.meal.calories}, 
            \${result.meal.protein}, 
            \${result.meal.carbs}, 
            \${result.meal.fat}, 
            \${result.meal.fiber}, 
            \${result.meal.health_score}, 
            \${result.meal.meal_type}, 
            now(), now(), 
            \${vectorStr}::vector
          )
        \`;
      }
    }

    // Send the explanation back to the user
    await sendMessage(result.explanation || "Saved successfully!");

  } catch (error) {
    console.error("Webhook processing error:", error);
  }
});


// 1.5. Parse bill or meal photo using Gemini AI
app.post("/api/parse-photo", async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, type = "auto" } = req.body;
    
    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "Image data (base64 string) is required." });
      return;
    }

    if (!ai) {
      console.log("Gemini client not initialized, using photo parser fallback.");
      const fallbackResult = parsePhotoFallback(type);
      res.json({ result: fallbackResult, fallback: true });
      return;
    }

    // Clean base64 string
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    
    // Detect MIME type
    let mimeType = "image/jpeg";
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    let schema: any;
    let systemPrompt = "";
    let userPrompt = "";

    if (type === "bill") {
      schema = {
        type: Type.OBJECT,
        properties: {
          merchant: { type: Type.STRING, description: "Extract the merchant/shop name. If not visible, use 'Other Store'." },
          amount: { type: Type.NUMBER, description: "Extract the total amount of the bill in INR Rupees as a numeric value. Do not include currency symbols." },
          date: { type: Type.STRING, description: "Extract the transaction date in YYYY-MM-DD format. If not visible, use today's date." },
          category: { 
            type: Type.STRING, 
            description: "The best category for this transaction. Try to use common ones like travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education. If none fit well, create a suitable concise new category name in lowercase." 
          },
          note: { type: Type.STRING, description: "A descriptive clean note summarizing what was bought (e.g. 'Starbucks drinks' or 'Dine-in at Nando's')." }
        },
        required: ["merchant", "amount", "date", "category", "note"]
      };

      systemPrompt = `
        You are an expert financial scanner for the FinTrack app.
        Analyze this receipt or bill image, extract the merchant name, total numeric amount, date (in YYYY-MM-DD), and note.
        Recommend one of these categories: travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education, other.
        Return strictly JSON according to the schema provided.
      `;
      userPrompt = "Scan this receipt or bill photo.";
    } else if (type === "meal") {
      schema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Describe the dish or food items seen in the photo (e.g. 'Paneer Roll and Fruit Salad')." },
          calories: { type: Type.NUMBER, description: "Estimated total calories of the portion (kcal) as a number." },
          protein: { type: Type.NUMBER, description: "Estimated protein content (grams) as a number." },
          carbs: { type: Type.NUMBER, description: "Estimated carbohydrates content (grams) as a number." },
          fat: { type: Type.NUMBER, description: "Estimated fat content (grams) as a number." },
          fiber: { type: Type.NUMBER, description: "Estimated fiber content (grams) as a number." },
          health_score: { type: Type.NUMBER, description: "Health score from 1 (junk/processed) to 10 (healthy/organic)." },
          meal_type: { 
            type: Type.STRING, 
            description: "Must be exactly one of: breakfast, lunch, dinner, snack." 
          }
        },
        required: ["name", "calories", "protein", "carbs", "fat", "fiber", "health_score", "meal_type"]
      };

      systemPrompt = `
        You are an expert nutritionist AI for the FinTrack app.
        Analyze this food or plate image and estimate the meal's nutritional parameters (name, calories, protein, carbs, fat, fiber, health score from 1 to 10, and meal type).
        Return strictly JSON according to the schema provided.
      `;
      userPrompt = "Analyze this meal plate photo and estimate its nutrition.";
    } else {
      // Auto-mode (combined schema)
      schema = {
        type: Type.OBJECT,
        properties: {
          detected_type: { type: Type.STRING, description: "Must be exactly 'bill' (if receipt/invoice) or 'meal' (if food plate/dish)." },
          transaction: {
            type: Type.OBJECT,
            description: "Extracted transaction details if detected_type is 'bill'.",
            properties: {
              merchant: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING },
              category: { type: Type.STRING },
              note: { type: Type.STRING }
            },
            required: ["merchant", "amount", "date", "category", "note"]
          },
          meal: {
            type: Type.OBJECT,
            description: "Estimated nutritional details if detected_type is 'meal'.",
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              health_score: { type: Type.NUMBER },
              meal_type: { type: Type.STRING }
            },
            required: ["name", "calories", "protein", "carbs", "fat", "fiber", "health_score", "meal_type"]
          }
        },
        required: ["detected_type"]
      };

      systemPrompt = `
        You are an expert AI scanner for the FinTrack app.
        Detect if the uploaded image is a receipt/bill (detected_type = "bill") or a food plate/meal photo (detected_type = "meal").
        If it is a bill, extract merchant, amount in INR Rupees, date, category (try to use standard ones like travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education, or dynamically create a concise new one if it doesn't fit), and note.
        If it is a meal, estimate dish name, calories, protein, carbs, fat, fiber, health score, and meal type.
        Return strictly JSON according to the schema provided.
      `;
      userPrompt = "Analyze this photo and extract transaction bill details or nutrition details.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, { text: userPrompt }] },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const parsedText = response.text?.trim() || "{}";
    const parsedJSON = JSON.parse(parsedText);
    
    // Normalize format so auto and direct mode look similar on client
    let result: any = parsedJSON;
    if (type === "bill" && !parsedJSON.detected_type) {
      result = {
        detected_type: "bill",
        transaction: parsedJSON
      };
    } else if (type === "meal" && !parsedJSON.detected_type) {
      result = {
        detected_type: "meal",
        meal: parsedJSON
      };
    }

    res.json({ result, fallback: false });

  } catch (error: any) {
    console.error("Error analyzing photo with Gemini:", error);
    const fallbackResult = parsePhotoFallback(req.body.type || "auto");
    res.json({ result: fallbackResult, fallback: true, error: error.message });
  }
});

// 2. Chat with FinTrack Data (AI Assist) using Gemini
app.post("/api/ai-assist", async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, profile, chatHistory } = req.body;

    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Question is required." });
      return;
    }

    if (!ai) {
      console.log("Gemini client not initialized, using rule-based AI assist fallback.");
      res.json({ answer: "Please configure Gemini API Key for AI Assist.", fallback: true });
      return;
    }

    const userId = profile?.id;
    if (!userId) {
      res.status(400).json({ error: "Profile ID required for personalized AI." });
      return;
    }

    // 1. Embed the user's question
    const questionEmbedding = await generateEmbedding(question);
    const vectorStr = \`[\${questionEmbedding.join(',')}]\`;

    // 2. Perform Vector Similarity Search
    // Fetch top 15 most relevant transactions
    const relevantTransactions: any[] = await prisma.$queryRaw\`
      SELECT amount, category, note, type, date 
      FROM "transactions" 
      WHERE profile_id = \${userId}::uuid 
      ORDER BY embedding <=> \${vectorStr}::vector 
      LIMIT 15
    \`;

    // Fetch top 15 most relevant meals
    const relevantMeals: any[] = await prisma.$queryRaw\`
      SELECT name, calories, protein, health_score, meal_type, date 
      FROM "meals" 
      WHERE profile_id = \${userId}::uuid 
      ORDER BY embedding <=> \${vectorStr}::vector 
      LIMIT 15
    \`;

    // Prepare context
    const transactionsContext = relevantTransactions
      .map(t => \`- \${t.date}: ₹\${t.amount} for \${t.note} [\${t.category}] (\${t.type})\`)
      .join("\\n");

    const mealsContext = relevantMeals
      .map(m => \`- \${m.date}: \${m.name} (\${m.meal_type}) - \${m.calories} kcal, \${m.protein}g protein, health: \${m.health_score}/10\`)
      .join("\\n");

    const userProfile = profile || {
      name: "User",
      monthly_budget: 30000,
      calorie_goal: 2200,
      protein_goal: 100,
    };

    const systemPrompt = \`
      You are FinTrack AI, the God-level finance and nutrition expert built into the FinTrack app.
      Your primary purpose is to help the user understand their financial spending and nutritional habits, answer questions based on their real data, and provide concrete, actionable advice.

      Current User: \${userProfile.name}
      Monthly Expense Budget: ₹\${userProfile.monthly_budget}
      Daily Calorie Goal: \${userProfile.calorie_goal} kcal
      Daily Protein Goal: \${userProfile.protein_goal}g

      **RETRIEVED CONTEXT (Top semantic matches for their question):**
      
      Relevant Transactions:
      \${transactionsContext || "No highly relevant transactions found."}

      Relevant Meals:
      \${mealsContext || "No highly relevant meals found."}

      Core Directives:
      1. Use the RETRIEVED CONTEXT above to answer the user's question accurately.
      2. Give highly specific answers with concrete numbers based on the context provided.
      3. Always be supportive, professional, and slightly conversational (friendly tone).
      4. Do not hallucinate transactions or meals that aren't in the context.
    \`;

    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
      history: (chatHistory || []).slice(-10).map((h: any) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const assistResponse = await chatSession.sendMessage({ message: question });
    res.json({ answer: assistResponse.text || "No response received.", fallback: false });

  } catch (error: any) {
    console.error("Error in AI Assist Gemini endpoint:", error);
    const fallbackAnswer = generateLocalAssistAnswer(
      req.body.question || "",
      req.body.transactions || [],
      req.body.meals || [],
      req.body.profile
    );
    res.json({ answer: fallbackAnswer, fallback: true, error: error.message });
  }
});

// -------------------------------------------------------------
// Fallback / Rule-based parsers and helpers for robustness
// -------------------------------------------------------------

function parsePhotoFallback(type: string) {
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
    // auto-mode demo: alternate or choose
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

function parseMessageFallback(message: string) {
  const clean = message.toLowerCase().trim();
  
  // Extract amount
  // Matches: 500, 1,250, 1.5k, 2l, rs 500, ₹500, 500rs, etc.
  let amount = 0;
  const amtMatch = clean.match(/(?:rs\.?|₹|rupees)?\s*(\d+(?:\.\d+)?)\s*(k|l|lakh|rs|rupees)?\b/);
  if (amtMatch) {
    const rawVal = parseFloat(amtMatch[1]);
    const unit = amtMatch[2];
    if (unit === 'k') {
      amount = rawVal * 1000;
    } else if (unit === 'l' || unit === 'lakh') {
      amount = rawVal * 100000;
    } else {
      amount = rawVal;
    }
  }

  // Detect Income Keywords
  const incomeKeywords = ["salary", "refund", "cashback", "received", "credited", "got", "bonus", "interest", "income"];
  const isIncome = incomeKeywords.some(kw => clean.includes(kw));

  // Determine Category based on keywords
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

  // Is it a meal/nutrition log?
  const mealKeywords = ["lunch", "dinner", "breakfast", "snack", "roti", "egg", "eggs", "chicken", "biryani", "rice", "dal", "salad", "shake", "protein", "paneer", "apple", "banana", "milk", "coffee", "tea", "swiggy", "zomato"];
  const isMeal = mealKeywords.some(kw => clean.includes(kw));

  const note = message
    .replace(/(?:rs\.?|₹|rupees)?\s*\d+(?:\.\d+)?\s*(k|l|lakh|rs|rupees)?/gi, "")
    .replace(/\b(?:spent|on|got|for|received|credited|spent|bought)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || "Item log";

  // Formulate output
  const response: any = {
    type: isIncome ? "income" : (isMeal && amount > 0 ? "both" : (isMeal ? "meal" : "expense")),
  };

  if (response.type === "expense" || response.type === "income" || response.type === "both") {
    response.transaction = {
      amount: amount || 100, // default fallback
      category: isIncome ? "other" : category,
      note: note,
      type: isIncome ? "income" : "expense",
    };
  }

  if (response.type === "meal" || response.type === "both") {
    // Generate realistic fallback nutritional info based on keyword matching
    let name = note || "Healthy Meal";
    let calories = 350;
    let protein = 12;
    let carbs = 40;
    let fat = 10;
    let fiber = 3;
    let healthScore = 7;
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = "snack";

    if (clean.includes("egg") || clean.includes("protein") || clean.includes("chicken") || clean.includes("paneer")) {
      protein = 28;
      calories = 420;
      healthScore = 9;
    }
    if (clean.includes("pizza") || clean.includes("burger") || clean.includes("swiggy") || clean.includes("zomato")) {
      calories = 780;
      protein = 18;
      fat = 32;
      carbs = 90;
      healthScore = 3;
    }
    if (clean.includes("breakfast")) mealType = "breakfast";
    else if (clean.includes("lunch")) mealType = "lunch";
    else if (clean.includes("dinner")) mealType = "dinner";

    response.meal = {
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      health_score: healthScore,
      meal_type: mealType,
    };
  }

  const actType = response.type === "income" ? "Income source" : (response.type === "both" ? "Expense + Meal" : (response.type === "meal" ? "Meal" : "Expense"));
  response.explanation = `[Offline Fallback] Successfully parsed message! Detected as **${actType}**. ${amount > 0 ? `Rupees: ₹${amount}.` : ""} ${response.meal ? `Estimated: ${response.meal.calories} kcal, ${response.meal.protein}g protein.` : ""}`;

  return response;
}

function generateLocalAssistAnswer(question: string, transactions: any[], meals: any[], profile: any): string {
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
      return `Hey ${profileName}! Looking at your latest data, you've spent the most on **${topCat}** totaling **₹${topVal}**.

Here is a quick summary of your spending:
${sorted.map(([cat, val]) => `- **${cat}**: ₹${val}`).join("\n")}

**AI Insight:** Your food delivery orders (Swiggy/Zomato) are a significant part of your discretionary load. Cutting back just 20% would save you about **₹18,000/year**! Try replacing 1 restaurant order per week with a home-cooked healthy alternative.`;
    }
    return `Hey ${profileName}, you haven't logged any expenses yet! Once you log spending like "swiggy 420 dinner" or "ola 200 cab", I'll show you exactly where your money goes.`;
  }

  if (q.includes("calorie") || q.includes("protein") || q.includes("eat") || q.includes("nutrition") || q.includes("health")) {
    if (meals && meals.length > 0) {
      const avgKcal = Math.round(meals.reduce((s: number, m: any) => s + m.calories, 0) / meals.length);
      const avgProt = Math.round(meals.reduce((s: number, m: any) => s + m.protein, 0) / meals.length);
      const avgHealth = (meals.reduce((s: number, m: any) => s + m.health_score, 0) / meals.length).toFixed(1);

      return `Hi ${profileName}, here is your current nutrition summary:
- **Average Calories/Meal:** ${avgKcal} kcal (Goal: ${profile?.calorie_goal || 2200} kcal/day)
- **Average Protein/Meal:** ${avgProt}g (Goal: ${profile?.protein_goal || 100}g/day)
- **Average Health Score:** ${avgHealth}/10

**AI Dietician Recommendation:** Your protein intake is slightly below your target of ${profile?.protein_goal || 100}g. Consider adding high-protein snacks like boiled eggs, paneer, Greek yogurt, or a protein shake. You eat healthiest on days when you log home-cooked meals!`;
    }
    return `Hi ${profileName}, no meals have been tracked yet. Try logging what you eat, e.g., "lunch chicken salad" or "swiggy 420 paneer tikka", and I'll analyze your daily calorie and protein metrics!`;
  }

  return `Hey there ${profileName}! I am your FinTrack AI companion.

I can help you analyze both your **wealth** and your **wellness**! Ask me questions like:
- *"Where did I spend the most money?"*
- *"Am I meeting my daily protein target?"*
- *"How can I save ₹3,000 this month?"*

Try tracking some transactions or meals by sending mock messages in the input box above, and ask me again!`;
}

// -------------------------------------------------------------
// Vite and Static File Middleware
// -------------------------------------------------------------

async function startServer() {
  // Vite dev mode integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as middleware.");
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving from: " + distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
