import { Router } from "express";
import { db, usersTable, issuesTable } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.points)).limit(50);
    const allIssues = await db.select().from(issuesTable);
    
    const result = users.map((user, idx) => {
      const issueCount = allIssues.filter(i => i.reportedBy === user.id).length;
      
      // Calculate dynamic verification count based on points and issue counts
      const verificationCount = Math.max(0, Math.floor((user.points - (issueCount * 10)) / 5));

      return {
        id: user.id,
        name: user.name,
        avatarColor: user.avatarColor || "#2563EB",
        points: user.points,
        badges: user.badges || [],
        issueCount,
        verificationCount,
        rank: idx + 1
      };
    });
    
    res.json(result);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;