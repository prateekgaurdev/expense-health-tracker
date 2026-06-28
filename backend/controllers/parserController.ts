import { Request, Response, NextFunction } from 'express';
import { parseMessageCore } from '../services/aiService';
import prisma from '../config/db';
import { generateEmbedding } from '../services/aiService';

export const parseMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, userId } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required and must be a string." });
      return;
    }
    const parsed = await parseMessageCore(message);
    const result = parsed.result;

    if (!userId) {
      res.json(parsed);
      return;
    }

    if (result.action === "delete" && result.target_description) {
      const targetEmbedding = await generateEmbedding(result.target_description);
      const vectorStr = `[${targetEmbedding.join(',')}]`;
      const matchingTxns: any[] = await prisma.$queryRaw`
        SELECT id FROM "transactions" WHERE profile_id = ${userId}::uuid ORDER BY embedding <=> ${vectorStr}::vector LIMIT 1;
      `;
      if (matchingTxns.length > 0) {
        await prisma.transaction.delete({ where: { id: matchingTxns[0].id } });
        parsed.result.deleted_id = matchingTxns[0].id;
      }
    } else if (result.action === "edit" && result.target_description && result.transaction) {
      const targetEmbedding = await generateEmbedding(result.target_description);
      const vectorStr = `[${targetEmbedding.join(',')}]`;
      const matchingTxns: any[] = await prisma.$queryRaw`
        SELECT id FROM "transactions" WHERE profile_id = ${userId}::uuid ORDER BY embedding <=> ${vectorStr}::vector LIMIT 1;
      `;
      if (matchingTxns.length > 0) {
        const match = matchingTxns[0];
        const newText = `${result.transaction.type}: ${result.transaction.amount} on ${result.transaction.category} - ${result.transaction.note}`;
        const newEmbedding = await generateEmbedding(newText);
        const newVectorStr = `[${newEmbedding.join(',')}]`;
        const updated = await prisma.transaction.update({
          where: { id: match.id },
          data: {
            amount: result.transaction.amount,
            category: result.transaction.category,
            note: result.transaction.note,
            type: result.transaction.type,
          }
        });
        await prisma.$executeRaw`UPDATE "transactions" SET embedding = ${newVectorStr}::vector WHERE id = ${match.id}`;
        parsed.result.updated_transaction = updated;
      }
    }

    res.json(parsed);
  } catch (error) {
    next(error);
  }
};
