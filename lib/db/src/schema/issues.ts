import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const issuesTable = pgTable("issues", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("reported"),
  imageUrl: text("image_url").notNull(),
  resolutionImageUrl: text("resolution_image_url"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  reportedBy: text("reported_by").notNull(),
  verifiedCount: integer("verified_count").notNull().default(0),
  verifiedBy: text("verified_by").array().notNull().default([]),
  aiConfidence: real("ai_confidence").notNull().default(0),
  aiTags: text("ai_tags").array().notNull().default([]),
  duplicateOf: text("duplicate_of"),
  zone: text("zone").notNull().default("Zone 1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertIssueSchema = createInsertSchema(issuesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issuesTable.$inferSelect;