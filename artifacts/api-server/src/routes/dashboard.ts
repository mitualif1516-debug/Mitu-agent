import { Router, type IRouter } from "express";
import {
  GetActivityLogQueryParams,
  GetActivityLogResponse,
  GetDashboardOverviewResponse,
  GetUserParams,
  GetUserResponse,
  GetUsageAnalyticsQueryParams,
  GetUsageAnalyticsResponse,
  ListUsersQueryParams,
  ListUsersResponse,
  UpdateUserSubscriptionBody,
  UpdateUserSubscriptionParams,
  UpdateUserSubscriptionResponse,
} from "@workspace/api-zod";
import { and, count, desc, eq, gte } from "drizzle-orm";
import {
  db,
  mituActivityTable,
  mituUsageEventsTable,
  mituUsersTable,
} from "@workspace/db";
import {
  ensureMituSeedData,
  getRemoteConfigRow,
  listMituUsers,
  serializeUser,
  startOfToday,
} from "../lib/mitu-store";

const router: IRouter = Router();

router.get("/dashboard/overview", async (req, res): Promise<void> => {
  await ensureMituSeedData();
  const config = await getRemoteConfigRow();
  const [[{ value: totalUsers }], [{ value: freeUsers }], [{ value: proUsers }], [{ value: actionsToday }]] =
    await Promise.all([
      db.select({ value: count() }).from(mituUsersTable),
      db.select({ value: count() }).from(mituUsersTable).where(eq(mituUsersTable.plan, "free")),
      db.select({ value: count() }).from(mituUsersTable).where(eq(mituUsersTable.plan, "pro")),
      db
        .select({ value: count() })
        .from(mituUsageEventsTable)
        .where(gte(mituUsageEventsTable.createdAt, startOfToday())),
    ]);
  const data = GetDashboardOverviewResponse.parse({
    totalUsers: Number(totalUsers),
    freeUsers: Number(freeUsers),
    proUsers: Number(proUsers),
    activeVoiceRequests: Math.max(1, Math.round(Number(actionsToday) / 6)),
    actionsToday: Number(actionsToday),
    apiHealth: config.translationEnabled ? "healthy" : "degraded",
    uptimeSeconds: process.uptime(),
  });
  res.json(data);
});

router.get("/dashboard/usage", async (req, res): Promise<void> => {
  const parsed = GetUsageAnalyticsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureMituSeedData();
  const days = parsed.data.range === "90d" ? 90 : parsed.data.range === "30d" ? 30 : 7;
  const events = await db
    .select()
    .from(mituUsageEventsTable)
    .where(gte(mituUsageEventsTable.createdAt, new Date(Date.now() - days * 86400000)));
  const points = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() - (days - index - 1) * 86400000);
    const dateKey = date.toISOString().slice(0, 10);
    const onDay = events.filter((event) => event.createdAt.toISOString().slice(0, 10) === dateKey);
    return {
      date: dateKey,
      voiceActions: onDay.filter((event) => event.actionType === "voice").length,
      translations: onDay.filter((event) => event.actionType === "translation").length,
      gestureSessions: onDay.filter((event) => event.actionType === "gesture").length,
    };
  });
  res.json(GetUsageAnalyticsResponse.parse({ range: parsed.data.range, points }));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const parsed = GetActivityLogQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureMituSeedData();
  const rows = await db
    .select()
    .from(mituActivityTable)
    .orderBy(desc(mituActivityTable.createdAt))
    .limit(parsed.data.limit);
  res.json(GetActivityLogResponse.parse(rows));
});

router.get("/dashboard/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { items, total } = await listMituUsers(
    parsed.data.query,
    parsed.data.plan,
    parsed.data.page,
    parsed.data.pageSize,
  );
  res.json(ListUsersResponse.parse({
    items,
    total,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  }));
});

router.get("/dashboard/users/:id", async (req, res): Promise<void> => {
  const parsed = GetUserParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureMituSeedData();
  const [user] = await db
    .select()
    .from(mituUsersTable)
    .where(eq(mituUsersTable.id, parsed.data.id))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const config = await getRemoteConfigRow();
  res.json(GetUserResponse.parse(serializeUser(user, config.freeDailyActionLimit)));
});

router.patch("/dashboard/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserSubscriptionParams.safeParse(req.params);
  const body = UpdateUserSubscriptionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    const message = params.success
      ? body.success
        ? "Invalid request"
        : body.error.message
      : params.error.message;
    res.status(400).json({ error: message });
    return;
  }
  await ensureMituSeedData();
  const [user] = await db
    .update(mituUsersTable)
    .set({ plan: body.data.plan, lastActiveAt: new Date() })
    .where(eq(mituUsersTable.id, params.data.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const config = await getRemoteConfigRow();
  res.json(UpdateUserSubscriptionResponse.parse(serializeUser(user, config.freeDailyActionLimit)));
});

export default router;