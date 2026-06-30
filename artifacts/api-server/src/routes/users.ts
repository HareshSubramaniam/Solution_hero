import { Router } from "express";
import { db, usersTable, issuesTable, activityLogTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/users/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userIssues = await db.select().from(issuesTable).where(eq(issuesTable.reportedBy, id));

    res.json({
      ...user,
      issueCount: userIssues.length,
      issues: userIssues,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id/activity", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const activities = await db
      .select({
        id: activityLogTable.id,
        userId: activityLogTable.userId,
        action: activityLogTable.action,
        points: activityLogTable.points,
        issueId: activityLogTable.issueId,
        timestamp: activityLogTable.timestamp,
        issueTitle: issuesTable.title,
      })
      .from(activityLogTable)
      .leftJoin(issuesTable, eq(activityLogTable.issueId, issuesTable.id))
      .where(eq(activityLogTable.userId, id))
      .orderBy(sql`${activityLogTable.timestamp} DESC`);

    res.json(activities);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
