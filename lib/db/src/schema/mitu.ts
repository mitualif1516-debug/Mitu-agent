import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const mituUsersTable = pgTable("mitu_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  plan: text("plan").notNull().default("free"),
  role: text("role").notNull().default("user"),
  actionsToday: integer("actions_today").notNull().default(0),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mituActivityTable = pgTable("mitu_activity", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  userName: text("user_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mituUsageEventsTable = pgTable("mitu_usage_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  actionType: text("action_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mituRemoteConfigTable = pgTable("mitu_remote_config", {
  id: text("id").primaryKey(),
  freeDailyActionLimit: integer("free_daily_action_limit").notNull().default(10),
  freeLockScreenLimit: integer("free_lock_screen_limit").notNull().default(3),
  gesturesEnabled: boolean("gestures_enabled").notNull().default(true),
  translationEnabled: boolean("translation_enabled").notNull().default(true),
  autoSendEnabled: boolean("auto_send_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertMituUserSchema = createInsertSchema(mituUsersTable).omit({
  lastActiveAt: true,
  createdAt: true,
});
export const insertMituActivitySchema = createInsertSchema(mituActivityTable).omit({
  createdAt: true,
});
export const insertMituUsageEventSchema = createInsertSchema(
  mituUsageEventsTable,
).omit({ createdAt: true });
export const insertMituRemoteConfigSchema = createInsertSchema(
  mituRemoteConfigTable,
).omit({ updatedAt: true });

export type InsertMituUser = z.infer<typeof insertMituUserSchema>;
export type MituUser = typeof mituUsersTable.$inferSelect;
export type MituActivity = typeof mituActivityTable.$inferSelect;
export type MituUsageEvent = typeof mituUsageEventsTable.$inferSelect;
export type MituRemoteConfig = typeof mituRemoteConfigTable.$inferSelect;