import { Request, Response, NextFunction } from 'express';
import { linkTelegramBot, processTelegramMessage } from '../services/telegramService';
import prisma from '../config/db';

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

export const disconnectTelegram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId is required." });
      return;
    }

    // Optionally fetch token to delete webhook on Telegram side
    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (profile?.telegram_bot_token) {
      try {
        await fetch(`https://api.telegram.org/bot${profile.telegram_bot_token}/deleteWebhook`);
      } catch (e) {
        console.error("Failed to delete webhook on Telegram:", e);
      }
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { telegram_bot_token: null, telegram_chat_id: null }
    });

    res.json({ success: true, message: "Bot disconnected successfully!" });
  } catch (error) {
    next(error);
  }
};
