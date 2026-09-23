import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  RecordMobileUsageBody,
  RecordMobileUsageResponse,
  TranslateTextBody,
  TranslateTextResponse,
} from "@workspace/api-zod";
import { and, eq } from "drizzle-orm";
import {
  db,
  mituUsageEventsTable,
  mituUsersTable,
} from "@workspace/db";
import {
  ensureMituSeedData,
  getRemoteConfigRow,
  getUsageCount,
} from "../lib/mitu-store";

const router: IRouter = Router();

router.post("/mobile/usage", async (req, res): Promise<void> => {
  const parsed = RecordMobileUsageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureMituSeedData();
  const [user] = await db
    .select()
    .from(mituUsersTable)
    .where(eq(mituUsersTable.id, parsed.data.userId))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const config = await getRemoteConfigRow();
  const limit = user.plan === "pro"
    ? 999999
    : parsed.data.actionType === "lockscreen"
      ? config.freeLockScreenLimit
      : config.freeDailyActionLimit;
  const used = await getUsageCount(parsed.data.userId, parsed.data.actionType);
  if (used >= limit) {
    res.status(429).json(RecordMobileUsageResponse.parse({
      allowed: false,
      plan: user.plan === "pro" ? "pro" : "free",
      used,
      limit,
      remaining: 0,
    }));
    return;
  }

  await db.insert(mituUsageEventsTable).values({
    id: randomUUID(),
    userId: parsed.data.userId,
    actionType: parsed.data.actionType,
  });
  await db
    .update(mituUsersTable)
    .set({ actionsToday: user.actionsToday + 1, lastActiveAt: new Date() })
    .where(eq(mituUsersTable.id, parsed.data.userId));
  const nextUsed = used + 1;
  res.json(RecordMobileUsageResponse.parse({
    allowed: true,
    plan: user.plan === "pro" ? "pro" : "free",
    used: nextUsed,
    limit,
    remaining: Math.max(0, limit - nextUsed),
  }));
});

const translations: Record<string, Record<string, string>> = {
  "bn:en": {
    "হ্যালো": "Hello",
    "কেমন আছো": "How are you?",
    "শুভ সকাল": "Good morning",
    "ধন্যবাদ": "Thank you",
  },
  "en:bn": {
    hello: "হ্যালো",
    "how are you?": "কেমন আছো?",
    "good morning": "শুভ সকাল",
    "thank you": "ধন্যবাদ",
  },
  "es:en": {
    hola: "Hello",
    gracias: "Thank you",
  },
  "en:es": {
    hello: "Hola",
    thanks: "Gracias",
  },
  "hi:en": {
    नमस्ते: "Hello",
    धन्यवाद: "Thank you",
  },
  "en:hi": {
    hello: "नमस्ते",
    thanks: "धन्यवाद",
  },
};

router.post("/mobile/translate", async (req, res): Promise<void> => {
  const parsed = TranslateTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const key = `${parsed.data.sourceLanguage.toLowerCase()}:${parsed.data.targetLanguage.toLowerCase()}`;
  const dictionary = translations[key];
  const normalized = parsed.data.text.trim().toLowerCase();
  const text = dictionary?.[normalized] ?? parsed.data.text;
  res.json(TranslateTextResponse.parse({
    text,
    sourceLanguage: parsed.data.sourceLanguage,
    targetLanguage: parsed.data.targetLanguage,
    provider: dictionary?.[normalized] ? "mitu-translation-v1" : "passthrough-fallback",
  }));
});

export default router;