import { Router } from "express";
import { db, issuesTable, usersTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  try {
    const allIssues = await db.select().from(issuesTable);
    
    const totalIssues = allIssues.length;
    const resolvedIssues = allIssues.filter(i => i.status === "resolved").length;
    
    // Unique reporters
    const uniqueReporters = new Set(allIssues.map(i => i.reportedBy).filter(Boolean));
    const activeReporters = uniqueReporters.size;
    
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;
    
    // Average resolution time
    let totalResolutionMs = 0;
    let resolvedCountWithTime = 0;
    allIssues.forEach(i => {
      if (i.status === "resolved" && i.createdAt && i.updatedAt) {
        const diff = new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime();
        if (diff > 0) {
          totalResolutionMs += diff;
          resolvedCountWithTime++;
        }
      }
    });
    
    const avgResolutionDays = resolvedCountWithTime > 0 
      ? Math.max(1, Math.round(totalResolutionMs / (1000 * 60 * 60 * 24 * resolvedCountWithTime))) 
      : 2; // fallback to 2 days
      
    // byCategory: [{ category: "pothole", count: 12 }, ...]
    const categoryMap: Record<string, number> = {};
    allIssues.forEach(i => {
      const cat = i.category || "other";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const byCategory = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));
    
    // byStatus: [{ status: "reported", count: 5 }, ...]
    const statusMap: Record<string, number> = {};
    allIssues.forEach(i => {
      const status = i.status || "reported";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    const byStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
    
    // bySeverity: [{ severity: "high", count: 8 }, ...]
    const severityMap: Record<string, number> = {};
    allIssues.forEach(i => {
      const sev = i.severity || "medium";
      severityMap[sev] = (severityMap[sev] || 0) + 1;
    });
    const bySeverity = Object.entries(severityMap).map(([severity, count]) => ({ severity, count }));
    
    // byZone: [{ zone: "Zone 1", count: 10, resolved: 4 }, ...]
    const zoneMap: Record<string, { count: number, resolved: number }> = {};
    allIssues.forEach(i => {
      const zone = i.zone || "Zone 1";
      if (!zoneMap[zone]) {
        zoneMap[zone] = { count: 0, resolved: 0 };
      }
      zoneMap[zone].count++;
      if (i.status === "resolved") {
        zoneMap[zone].resolved++;
      }
    });
    const byZone = Object.entries(zoneMap).map(([zone, data]) => ({
      zone,
      count: data.count,
      resolved: data.resolved
    }));
    
    // recentResolutions: count of resolved issues per day over last 7 days (dates formatted as MM/DD)
    const recentResolutions: { date: string, count: number }[] = [];
    const last7Days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      return d;
    }).reverse();
    
    last7Days.forEach(day => {
      const formattedDate = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = allIssues.filter(i => {
        if (i.status !== "resolved" || !i.updatedAt) return false;
        const resolvedDate = new Date(i.updatedAt);
        return resolvedDate.toDateString() === day.toDateString();
      }).length;
      recentResolutions.push({ date: formattedDate, count });
    });
    
    res.json({
      totalIssues,
      resolvedIssues,
      activeReporters,
      resolutionRate,
      avgResolutionDays,
      byCategory,
      byStatus,
      bySeverity,
      byZone,
      recentResolutions,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;