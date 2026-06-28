import { Router } from 'express';
import { parseMessage } from '../controllers/parserController';
import { saveBotToken, telegramWebhook, disconnectTelegram } from '../controllers/telegramController';
import { parsePhoto } from '../controllers/scannerController';
import { aiAssist } from '../controllers/chatController';
import { updateTransaction, deleteTransaction, updateMeal, deleteMeal } from '../controllers/dataController';

const router = Router();

// Text parsing route
router.post('/parse', parseMessage as any);

// Telegram integration routes
router.post('/save-bot-token', saveBotToken as any);
router.post('/disconnect-bot', disconnectTelegram as any);
router.post('/telegram-webhook/:userId', telegramWebhook as any);

// Photo scanning route
router.post('/parse-photo', parsePhoto as any);

// Chat assist route
router.post('/ai-assist', aiAssist as any);

// Data Management routes
router.put('/transaction/:id', updateTransaction as any);
router.delete('/transaction/:id', deleteTransaction as any);
router.put('/meal/:id', updateMeal as any);
router.delete('/meal/:id', deleteMeal as any);

export default router;
