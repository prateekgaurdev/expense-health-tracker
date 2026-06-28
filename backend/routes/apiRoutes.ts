import { Router } from 'express';
import { parseMessage } from '../controllers/parserController';
import { saveBotToken, telegramWebhook } from '../controllers/telegramController';
import { parsePhoto } from '../controllers/scannerController';
import { aiAssist } from '../controllers/chatController';
import { updateTransaction, deleteTransaction, updateMeal, deleteMeal } from '../controllers/dataController';

const router = Router();

// Text parsing route
router.post('/parse', parseMessage);

// Telegram integration routes
router.post('/save-bot-token', saveBotToken);
router.post('/telegram-webhook/:userId', telegramWebhook);

// Photo scanning route
router.post('/parse-photo', parsePhoto);

// Chat assist route
router.post('/ai-assist', aiAssist);

// Data Management routes
router.put('/transaction/:id', updateTransaction);
router.delete('/transaction/:id', deleteTransaction);
router.put('/meal/:id', updateMeal);
router.delete('/meal/:id', deleteMeal);

export default router;
