import { Request, Response, NextFunction } from 'express';
import { Type } from "@google/genai";
import ai from '../config/ai';
import { parsePhotoFallback } from '../services/aiService';

export const parsePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    let mimeType = "image/jpeg";
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }

    const imagePart = {
      inlineData: { mimeType: mimeType, data: cleanBase64 },
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

      systemPrompt = `You are an expert AI scanner for the FinTrack app.\nAnalyze this receipt/invoice image and extract the merchant, amount in INR Rupees, date, category, and note.\nReturn strictly JSON according to the schema provided.`;
      userPrompt = "Analyze this receipt and extract transaction details.";
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

      systemPrompt = `You are an expert nutritionist AI for the FinTrack app.\nAnalyze this food or plate image and estimate the meal's nutritional parameters (name, calories, protein, carbs, fat, fiber, health score from 1 to 10, and meal type).\nReturn strictly JSON according to the schema provided.`;
      userPrompt = "Analyze this meal plate photo and estimate its nutrition.";
    } else {
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

      systemPrompt = `You are an expert AI scanner for the FinTrack app.\nDetect if the uploaded image is a receipt/bill (detected_type = "bill") or a food plate/meal photo (detected_type = "meal").\nIf it is a bill, extract merchant, amount in INR Rupees, date, category (try to use standard ones like travel, food, groceries, clothes, rent, bills, luxuries, investments, health, education, or dynamically create a concise new one if it doesn't fit), and note.\nIf it is a meal, estimate dish name, calories, protein, carbs, fat, fiber, health score, and meal type.\nReturn strictly JSON according to the schema provided.`;
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
    
    let result: any = parsedJSON;
    if (type === "bill" && !parsedJSON.detected_type) {
      result = { detected_type: "bill", transaction: parsedJSON };
    } else if (type === "meal" && !parsedJSON.detected_type) {
      result = { detected_type: "meal", meal: parsedJSON };
    }

    res.json({ result, fallback: false });
  } catch (error) {
    next(error);
  }
};
