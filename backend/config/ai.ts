import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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

export default ai;
