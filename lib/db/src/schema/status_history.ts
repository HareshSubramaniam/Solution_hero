import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const statusHistoryTable = pgTable("status_history", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  status: text("status").notNull(),
  note: text("note"),
  updatedBy: text("updated_by").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertStatusHistorySchema = createInsertSchema(statusHistoryTable).omit({
  timestamp: true,
});
export type InsertStatusHistory = z.infer<typeof insertStatusHistorySchema>;
export type StatusHistory = typeof statusHistoryTable.$inferSelect;