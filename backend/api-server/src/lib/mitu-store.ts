import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gte, ilike, sql } from "drizzle-orm";
import {
  db,
  mituActivityTable,
  mituRemoteConfigTable,
  mituUsageEventsTable,
  mituUsersTable,
} from "@workspace/db";

const seedUsers = [
  ["usr_nabila", "Nabila Rahman", "nabila@mitu.app", "pro", "user"],
  ["usr_arif", "Arif Hossain", "arif@mitu.app", "free", "user"],
  ["usr_sadia", "Sadia Akter", "sadia@mitu.app", "pro", "user"],
  ["usr_tanvir", "Tanvir Ahmed", "tanvir@mitu.app", "free", "user"],
  ["usr_rahim", "Rahim Uddin", "rahim@mitu.app", "free", "user"],
  ["usr_mitu_admin", "Mitu Operations", "ops@mitu.app", "pro", "admin"],
] as const;

let seedPromise: Promise<void> | undefined;

export async function ensureMituSeedData(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [config] = await db
        .select({ id: mituRemoteConfigTable.id })
        .from(mituRemoteConfigTable)
        .limit(1);
      if (!config) {
        await db.insert(mituRemoteConfigTable).values({
          id: "default",
          freeDailyActionLimit: 10,
          freeLockScreenLimit: 3,
          gesturesEnabled: true,
          translationEnabled: true,
          autoSendEnabled: false,
        });
      }

      const [{ value: userCount }] = await db
        .select({ value: count() })
        .from(mituUsersTable);
      if (Number(userCount) === 0) {
        await db.insert(mituUsersTable).values(
          seedUsers.map(([id, name, email, plan, role], index) => ({
            id,
            name,
            email,
            plan,
            role,
            actionsToday: index % 3 === 0 ? 8 : index + 1,
            lastActiveAt: new Date(Date.now() - index * 1000 * 60 * 13),
          })),
        );

        const now = Date.now();
        await db.insert(mituActivityTable).values([
          {
            id: randomUUID(),
            type: "voice",
            title: "Voice request completed",
            description: "Opened WhatsApp and drafted a reply",
            userName: "Nabila Rahman",
            createdAt: new Date(now - 1000 * 60 * 4),
          },
          {
            id: randomUUID(),
            type: "translation",
            title: "Translation finished",
            description: "Bengali to English · 2.4s",
            userName: "Sadia Akter",
            createdAt: new Date(now - 1000 * 60 * 11),
          },
          {
            id: randomUUID(),
            type: "gesture",
            title: "Air gesture session started",
            description: "Index tracking enabled",
            userName: "Arif Hossain",
            createdAt: new Date(now - 1000 * 60 * 23),
          },
          {
            id: randomUUID(),
            type: "subscription",
            title: "Subscription upgraded",
            description: "Free to Pro",
            userName: "Tanvir Ahmed",
            createdAt: new Date(now - 1000 * 60 * 41),
          },
          {
            id: randomUUID(),
            type: "system",
            title: "Remote config synced",
            description: "Mobile clients received latest limits",
            userName: null,
            createdAt: new Date(now - 1000 * 60 * 68),
          },
        ]);

        const usageRows = Array.from({ length: 28 }, (_, index) => ({
          id: randomUUID(),
          userId: seedUsers[index % seedUsers.length][0],
          actionType: (["voice", "translation", "gesture"] as const)[index % 3],
          createdAt: new Date(now - index * 1000 * 60 * 87),
        }));
        await db.insert(mituUsageEventsTable).values(usageRows);
      }
    })();
  }

  await seedPromise;
}

export async function getRemoteConfigRow() {
  await ensureMituSeedData();
  const [config] = await db
    .select()
    .from(mituRemoteConfigTable)
    .where(eq(mituRemoteConfigTable.id, "default"))
    .limit(1);
  if (!config) {
    throw new Error("Mitu remote config is unavailable");
  }
  return config;
}

export function startOfToday(): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function getUsageCount(
  userId: string,
  actionType: string,
): Promise<number> {
  const [{ value }] = await db
    .select({ value: count() })
    .from(mituUsageEventsTable)
    .where(
      and(
        eq(mituUsageEventsTable.userId, userId),
        eq(mituUsageEventsTable.actionType, actionType),
        gte(mituUsageEventsTable.createdAt, startOfToday()),
      ),
    );
  return Number(value);
}

export async function listMituUsers(
  query: string | undefined,
  plan: "all" | "free" | "pro",
  page: number,
  pageSize: number,
) {
  await ensureMituSeedData();
  const filters = [];
  if (query?.trim()) {
    const search = `%${query.trim()}%`;
    filters.push(
      sql`(${ilike(mituUsersTable.name, search)} OR ${ilike(mituUsersTable.email, search)})`,
    );
  }
  if (plan !== "all") {
    filters.push(eq(mituUsersTable.plan, plan));
  }
  const where = filters.length ? and(...filters) : undefined;
  const [items, [{ value: total }], config] = await Promise.all([
    db
      .select()
      .from(mituUsersTable)
      .where(where)
      .orderBy(desc(mituUsersTable.lastActiveAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(mituUsersTable).where(where),
    getRemoteConfigRow(),
  ]);
  return {
    items: items.map((user) => serializeUser(user, config.freeDailyActionLimit)),
    total: Number(total),
  };
}

export function serializeUser(
  user: typeof mituUsersTable.$inferSelect,
  freeActionLimit: number,
) {
  return {
    ...user,
    plan: user.plan === "pro" ? ("pro" as const) : ("free" as const),
    role: user.role === "admin" ? ("admin" as const) : ("user" as const),
    actionLimit: user.plan === "pro" ? 999999 : freeActionLimit,
  };
}