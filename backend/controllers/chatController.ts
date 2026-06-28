import { Request, Response, NextFunction } from 'express';
import ai from '../config/ai';
import prisma from '../config/db';
import { generateEmbedding, generateLocalAssistAnswer } from '../services/aiService';

export const aiAssist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const questionEmbedding = await generateEmbedding(question);
    const vectorStr = `[${questionEmbedding.join(',')}]`;

    const relevantTransactions: any[] = await prisma.$queryRaw`
      SELECT amount, category, note, type, date 
      FROM "transactions" 
      WHERE profile_id = ${userId}::uuid 
      ORDER BY embedding <=> ${vectorStr}::vector 
      LIMIT 15
    `;

    const relevantMeals: any[] = await prisma.$queryRaw`
      SELECT name, calories, protein, health_score, meal_type, date 
      FROM "meals" 
      WHERE profile_id = ${userId}::uuid 
      ORDER BY embedding <=> ${vectorStr}::vector 
      LIMIT 15
    `;

    const transactionsContext = relevantTransactions
      .map(t => `- ${t.date}: ₹${t.amount} for ${t.note} [${t.category}] (${t.type})`)
      .join("\\n");

    const mealsContext = relevantMeals
      .map(m => `- ${m.date}: ${m.name} (${m.meal_type}) - ${m.calories} kcal, ${m.protein}g protein, health: ${m.health_score}/10`)
      .join("\\n");

    const userProfile = profile || {
      name: "User",
      monthly_budget: 30000,
      calorie_goal: 2200,
      protein_goal: 100,
    };

    const systemPrompt = `
      You are FinTrack AI, the God-level finance and nutrition expert built into the FinTrack app.
      Your primary purpose is to help the user understand their financial spending and nutritional habits, answer questions based on their real data, and provide concrete, actionable advice.

      Current User: ${userProfile.name}
      Monthly Expense Budget: ₹${userProfile.monthly_budget}
      Daily Calorie Goal: ${userProfile.calorie_goal} kcal
      Daily Protein Goal: ${userProfile.protein_goal}g

      **RETRIEVED CONTEXT (Top semantic matches for their question):**
      
      Relevant Transactions:
      ${transactionsContext || "No highly relevant transactions found."}

      Relevant Meals:
      ${mealsContext || "No highly relevant meals found."}

      Core Directives:
      1. Use the RETRIEVED CONTEXT above to answer the user's question accurately.
      2. Give highly specific answers with concrete numbers based on the context provided.
      3. Always be supportive, professional, and slightly conversational (friendly tone).
      4. Do not hallucinate transactions or meals that aren't in the context.
    `;

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
};
