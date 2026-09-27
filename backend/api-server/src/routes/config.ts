import { Router, type IRouter } from "express";
import {
  GetRemoteConfigResponse,
  UpdateRemoteConfigBody,
  UpdateRemoteConfigResponse,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { db, mituRemoteConfigTable } from "@workspace/db";
import { ensureMituSeedData, getRemoteConfigRow } from "../lib/mitu-store";

const router: IRouter = Router();

router.get("/remote-config", async (_req, res): Promise<void> => {
  res.json(GetRemoteConfigResponse.parse(await getRemoteConfigRow()));
});

router.patch("/remote-config", async (req, res): Promise<void> => {
  const parsed = UpdateRemoteConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureMituSeedData();
  const [config] = await db
    .update(mituRemoteConfigTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(mituRemoteConfigTable.id, "default"))
    .returning();
  res.json(UpdateRemoteConfigResponse.parse(config));
});

export default router;