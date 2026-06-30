const fs = require('fs');
const path = require('path');

const files = {
"lib/db/drizzle.config.ts": `import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});`,
"lib/db/package.json": `{
  "name": "@workspace/db",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "push": "drizzle-kit push --config ./drizzle.config.ts",
    "push-force": "drizzle-kit push --force --config ./drizzle.config.ts"
  },
  "dependencies": {
    "drizzle-orm": "catalog:",
    "drizzle-zod": "^0.8.3",
    "pg": "^8.22.0",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@types/pg": "^8.20.0",
    "drizzle-kit": "^0.31.10"
  }
}`,
"lib/db/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}`,
"lib/db/src/index.ts": `import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema/index.js";`,
"lib/db/src/schema/activity_log.ts": `import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const activityLogTable = pgTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  points: integer("points").notNull().default(0),
  issueId: text("issue_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogTable).omit({
  timestamp: true,
});
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogTable.$inferSelect;`,
"lib/db/src/schema/comments.ts": `import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const commentsTable = pgTable("comments", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  userId: text("user_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({
  createdAt: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;`,
"lib/db/src/schema/index.ts": `export * from "./users.js";
export * from "./issues.js";
export * from "./status_history.js";
export * from "./comments.js";
export * from "./activity_log.js";`,
"lib/db/src/schema/issues.ts": `import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
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
export type Issue = typeof issuesTable.$inferSelect;`,
"lib/db/src/schema/status_history.ts": `import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
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
export type StatusHistory = typeof statusHistoryTable.$inferSelect;`,
"lib/db/src/schema/users.ts": `import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("citizen"),
  avatarColor: text("avatar_color").notNull().default("#2563EB"),
  points: integer("points").notNull().default(0),
  badges: text("badges").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;`
};

for (const [p, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
console.log("DB files created.");
