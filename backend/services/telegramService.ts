import prisma from "../config/db";
import { generateEmbedding, parseMessageCore } from "./aiService";

export async function linkTelegramBot(userId: string, botToken: string, appUrl: string) {
  await prisma.profile.upsert({
    where: { id: userId },
    update: { telegram_bot_token: botToken },
    create: { id: userId, telegram_bot_token: botToken }
  });

  const webhookUrl = `${appUrl}/api/telegram-webhook/${userId}`;
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || "Failed to set Telegram webhook.");
  }
  return data;
}

export async function processTelegramMessage(userId: string, text: string, chatId: number) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile || !profile.telegram_bot_token) {
    console.log("Profile or bot token not found for user:", userId);
    return;
  }
  const token = profile.telegram_bot_token;

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

  try {
    const parsed = await parseMessageCore(text);
    const result = parsed.result;

    if (!result) {
      await sendMessage("Sorry, I couldn't understand that. Please try again.");
      return;
    }

    if (result.action === "delete" && result.target_description) {
      const targetEmbedding = await generateEmbedding(result.target_description);
      const vectorStr = `[${targetEmbedding.join(',')}]`;
      
      const matchingTxns: any[] = await prisma.$queryRaw`
        SELECT id, note, amount, category FROM "transactions" WHERE profile_id = ${userId}::uuid ORDER BY embedding <=> ${vectorStr}::vector LIMIT 1;
      `;
      if (matchingTxns.length > 0) {
        const match = matchingTxns[0];
        await prisma.transaction.delete({ where: { id: match.id } });
        await sendMessage(result.explanation || `Deleted transaction: ${match.note || match.category} (₹${match.amount}).`);
      } else {
        await sendMessage("Could not find a transaction matching that description to delete.");
      }
      return;
    }

    if (result.action === "edit" && result.target_description && result.transaction) {
      const targetEmbedding = await generateEmbedding(result.target_description);
      const vectorStr = `[${targetEmbedding.join(',')}]`;
      
      const matchingTxns: any[] = await prisma.$queryRaw`
        SELECT id, note, amount, category FROM "transactions" WHERE profile_id = ${userId}::uuid ORDER BY embedding <=> ${vectorStr}::vector LIMIT 1;
      `;
      if (matchingTxns.length > 0) {
        const match = matchingTxns[0];
        const newText = `${result.transaction.type}: ${result.transaction.amount} on ${result.transaction.category} - ${result.transaction.note}`;
        const newEmbedding = await generateEmbedding(newText);
        const newVectorStr = `[${newEmbedding.join(',')}]`;

        await prisma.transaction.update({
          where: { id: match.id },
          data: {
            amount: result.transaction.amount,
            category: result.transaction.category,
            note: result.transaction.note,
            type: result.transaction.type,
          }
        });
        await prisma.$executeRaw`UPDATE "transactions" SET embedding = ${newVectorStr}::vector WHERE id = ${match.id}`;
        await sendMessage(result.explanation || `Updated transaction to ₹${result.transaction.amount} for ${result.transaction.note}.`);
      } else {
        await sendMessage("Could not find a transaction matching that description to edit.");
      }
      return;
    }

    // Handle Add Action
    if (result.type === "expense" || result.type === "income" || result.type === "both") {
      if (result.transaction) {
        const textToEmbed = `${result.transaction.type}: ${result.transaction.amount} on ${result.transaction.category} - ${result.transaction.note}`;
        const embedding = await generateEmbedding(textToEmbed);
        const vectorStr = `[${embedding.join(',')}]`;

        const txn = await prisma.transaction.create({
          data: {
            profile_id: userId,
            amount: result.transaction.amount,
            currency: result.transaction.currency || "INR",
            category: result.transaction.category,
            note: result.transaction.note,
            type: result.transaction.type,
            payment_method: result.transaction.payment_method || null,
            merchant: result.transaction.merchant || null,
            is_subscription: result.transaction.is_subscription || false,
          }
        });
        await prisma.$executeRaw`UPDATE "transactions" SET embedding = ${vectorStr}::vector WHERE id = ${txn.id}`;
      }
    }

    if (result.type === "meal" || result.type === "both") {
      if (result.meal) {
        const textToEmbed = `Ate ${result.meal.name} for ${result.meal.meal_type}. ${result.meal.calories} kcal, ${result.meal.protein}g protein, health score ${result.meal.health_score}.`;
        const embedding = await generateEmbedding(textToEmbed);
        const vectorStr = `[${embedding.join(',')}]`;

        const meal = await prisma.meal.create({
          data: {
            profile_id: userId,
            name: result.meal.name,
            calories: result.meal.calories,
            protein: result.meal.protein,
            carbs: result.meal.carbs,
            fat: result.meal.fat,
            fiber: result.meal.fiber,
            health_score: result.meal.health_score,
            meal_type: result.meal.meal_type,
            ingredients: result.meal.ingredients || [],
            cuisine: result.meal.cuisine || null,
            portion_size: result.meal.portion_size || null,
            is_home_cooked: result.meal.is_home_cooked || false,
          }
        });
        await prisma.$executeRaw`UPDATE "meals" SET embedding = ${vectorStr}::vector WHERE id = ${meal.id}`;
      }
    }

    const tip = "\nTip: Reply with 'edit <description> to <new amount/note>' to make changes.";
    await sendMessage((result.explanation || "Saved successfully!") + tip);
  } catch (error) {
    console.error("Error processing message:", error);
    await sendMessage("Sorry, an error occurred while processing your request. Please try again.");
  }
}
