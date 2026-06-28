import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { generateEmbedding } from '../services/aiService';

export const updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, category, note, type, payment_method, merchant, is_subscription } = req.body;
    
    let vectorStr: string | null = null;
    if (amount || category || note || type) {
      const existing = await prisma.transaction.findUnique({ where: { id } });
      if (existing) {
        const textToEmbed = `${type || existing.type}: ${amount || existing.amount} on ${category || existing.category} - ${note || existing.note}`;
        const embedding = await generateEmbedding(textToEmbed);
        vectorStr = `[${embedding.join(',')}]`;
      }
    }

    const txn = await prisma.transaction.update({
      where: { id },
      data: { amount, category, note, type, payment_method, merchant, is_subscription }
    });

    if (vectorStr) {
      await prisma.$executeRaw`UPDATE "transactions" SET embedding = ${vectorStr}::vector WHERE id = ${id}`;
    }

    res.json({ success: true, transaction: txn });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, calories, protein, carbs, fat, fiber, health_score, meal_type, ingredients, cuisine, portion_size, is_home_cooked } = req.body;
    
    let vectorStr: string | null = null;
    if (name || calories || protein || health_score || meal_type) {
      const existing = await prisma.meal.findUnique({ where: { id } });
      if (existing) {
        const textToEmbed = `Ate ${name || existing.name} for ${meal_type || existing.meal_type}. ${calories || existing.calories} kcal, ${protein || existing.protein}g protein, health score ${health_score || existing.health_score}.`;
        const embedding = await generateEmbedding(textToEmbed);
        vectorStr = `[${embedding.join(',')}]`;
      }
    }

    const meal = await prisma.meal.update({
      where: { id },
      data: { name, calories, protein, carbs, fat, fiber, health_score, meal_type, ingredients, cuisine, portion_size, is_home_cooked }
    });

    if (vectorStr) {
      await prisma.$executeRaw`UPDATE "meals" SET embedding = ${vectorStr}::vector WHERE id = ${id}`;
    }

    res.json({ success: true, meal });
  } catch (error) {
    next(error);
  }
};

export const deleteMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.meal.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
