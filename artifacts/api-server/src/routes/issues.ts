import { Router } from "express";
import { randomUUID } from "crypto";
import { db, usersTable, issuesTable, statusHistoryTable, commentsTable, activityLogTable } from "@workspace/db";
import { eq, sql, and, ilike, or } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  next();
}

router.get("/issues", async (req, res): Promise<void> => {
  try {
    const { search, category, status, severity } = req.query;
    const conditions = [];

    if (category && typeof category === "string" && category !== "all") {
      conditions.push(eq(issuesTable.category, category));
    }
    if (status && typeof status === "string" && status !== "all") {
      conditions.push(eq(issuesTable.status, status));
    }
    if (severity && typeof severity === "string" && severity !== "all") {
      conditions.push(eq(issuesTable.severity, severity));
    }
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(issuesTable.title, `%${search}%`),
          ilike(issuesTable.description, `%${search}%`),
          ilike(issuesTable.address, `%${search}%`)
        )
      );
    }

    let query = db.select().from(issuesTable);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(sql`${issuesTable.createdAt} DESC`);
    res.json(results.map(i => ({ ...i, reporterName: "Unknown", reporterAvatarColor: "#000" })));
  } catch (error) {
    console.error("Error listing issues:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/issues", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const body = req.body;
  const id = randomUUID();
  const [issue] = await db.insert(issuesTable).values({
    id, title: body.title, description: body.description, category: body.category, severity: body.severity ?? "medium",
    status: "reported", imageUrl: body.imageUrl ?? "url", latitude: body.latitude, longitude: body.longitude,
    address: body.address, reportedBy: userId, zone: body.zone || "Zone 1",
  }).returning();
  res.status(201).json({ ...issue, reporterName: "You", reporterAvatarColor: "#000" });
});

router.get("/issues/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const [issue] = await db.select().from(issuesTable).where(eq(issuesTable.id, id)).limit(1);
  if (!issue) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...issue, comments: [], statusHistory: [], reporterName: "Unknown", reporterAvatarColor: "#000" });
});

router.patch("/issues/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;
  const [issue] = await db.update(issuesTable).set(updates).where(eq(issuesTable.id, id)).returning();
  if (!issue) { res.status(404).json({ error: "Not found" }); return; }
  res.json(issue);
});

router.post("/issues/:id/verify", requireAuth, async (req, res): Promise<void> => {
  res.json({ verifiedCount: 1, pointsEarned: 5 });
});

router.post("/issues/:id/comments", requireAuth, async (req, res): Promise<void> => {
  res.json({});
});

export default router;