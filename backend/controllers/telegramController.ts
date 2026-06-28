import { Request, Response, NextFunction } from 'express';
import { linkTelegramBot, processTelegramMessage } from '../services/telegramService';

export const saveBotToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, botToken } = req.body;
    if (!userId || !botToken) {
      res.status(400).json({ error: "userId and botToken are required." });
      return;
    }

    let appUrl = process.env.APP_URL || req.headers.origin || "https://track.prateekgaur.in";
    
    // Telegram webhooks require HTTPS and cannot be localhost.
    if (appUrl.includes("localhost")) {
      appUrl = "https://track.prateekgaur.in";
    }

    await linkTelegramBot(userId, botToken, appUrl);
    
    res.json({ success: true, message: "Webhook successfully registered!" });
  } catch (error) {
    next(error);
  }
};

export const telegramWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const body = req.body;

    res.status(200).send("OK");

    if (!body.message || !body.message.text) return;
    
    const text = body.message.text;
    const chatId = body.message.chat.id;

    await processTelegramMessage(userId, text, chatId);

  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};
