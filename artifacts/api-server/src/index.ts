import app from "./app.js";
import { logger } from "./lib/logger.js";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { eq, ilike } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { db, issuesTable, usersTable } from "@workspace/db";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

async function seedDemoData() {
  try {
    const existingIssues = await db.select().from(issuesTable).limit(1);
    if (existingIssues.length === 0) {
      logger.info("Seeding Coimbatore demo data...");
      
      let users = await db.select().from(usersTable).limit(1);
      let reporterId = users.length > 0 ? users[0].id : null;
      
      if (!reporterId) {
        const [newUser] = await db.insert(usersTable).values({
          id: randomUUID(),
          email: "demo@coimbatore.in",
          name: "Demo User",
          passwordHash: "dummy",
          points: 100,
          role: "user"
        }).returning();
        reporterId = newUser.id;
      }

      const demoIssues = [
        {
          id: randomUUID(),
          title: "Deep pothole on Avinashi Road",
          description: "Large pothole causing traffic slowdowns near Peelamedu signal.",
          category: "pothole",
          severity: "high",
          status: "reported",
          latitude: 11.0268,
          longitude: 77.0058,
          address: "Avinashi Rd, Peelamedu, Coimbatore",
          reportedBy: reporterId,
          imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000",
          aiConfidence: 0.9,
          zone: "Zone 1"
        },
        {
          id: randomUUID(),
          title: "Broken Streetlight in RS Puram",
          description: "Streetlight pole #44 is completely dark, causing safety concerns.",
          category: "streetlight",
          severity: "medium",
          status: "verified",
          latitude: 11.0080,
          longitude: 76.9480,
          address: "DB Road, RS Puram, Coimbatore",
          reportedBy: reporterId,
          imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000",
          aiConfidence: 0.8,
          zone: "Zone 2"
        },
        {
          id: randomUUID(),
          title: "Garbage overflow at Gandhipuram",
          description: "Bins are overflowing near the cross cut road junction.",
          category: "garbage",
          severity: "high",
          status: "in_progress",
          latitude: 11.0180,
          longitude: 76.9640,
          address: "Cross Cut Rd, Gandhipuram, Coimbatore",
          reportedBy: reporterId,
          imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1000",
          aiConfidence: 0.95,
          zone: "Zone 3"
        },
        {
          id: randomUUID(),
          title: "Water logging under North Coimbatore bridge",
          description: "Drainage is blocked, water is accumulating.",
          category: "water",
          severity: "critical",
          status: "resolved",
          latitude: 11.0220,
          longitude: 76.9530,
          address: "North Coimbatore Flyover, Coimbatore",
          reportedBy: reporterId,
          imageUrl: "https://images.unsplash.com/photo-1600606154635-500a1069d782?auto=format&fit=crop&w=1000",
          resolutionImageUrl: "https://images.unsplash.com/photo-1599740831630-d3aa1729b4e5?auto=format&fit=crop&w=1000",
          aiConfidence: 0.88,
          zone: "Zone 1"
        }
      ];

      await db.insert(issuesTable).values(demoIssues);
      logger.info("Demo data seeded successfully.");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed demo data");
  }
}

async function updateExistingIssueImages() {
  try {
    const issues = await db.select().from(issuesTable);
    
    // Unsplash distinct images mapped perfectly to the issue names and categories
    const categoryImages: Record<string, string> = {
      pothole: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      streetlight: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
      garbage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      water: "https://images.unsplash.com/photo-1600606154635-500a1069d782?auto=format&fit=crop&w=800&q=80",
      water_leakage: "https://images.unsplash.com/photo-1600606154635-500a1069d782?auto=format&fit=crop&w=800&q=80",
      sewage: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80",
      property_damage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      other: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80"
    };

    const oldPlaceholders = [
      "picsum",
      "photo-1506084868230", // old pancakes
      "photo-1518005020951-eccb494ad742", // old abstract curves (streetlight)
      "photo-1478760329108-5c3ed9d495a0", // old incorrect streetlight galaxy/sunset
      "photo-1509021436665", // old incorrect streetlight book
      "photo-1513542789411", // old incorrect streetlight handlamp
      "photo-1563245372-f21724e3856d", // old dumpling food (garbage)
      "photo-1611284446314-60a58ac0deb9", // old incorrect garbage recycling bin
      "photo-1541855492-581f618f69a0", // old portrait (water)
      "photo-1519331379826-f10be5486c6f", // old park path (water)
      "photo-1485594050903", // old incorrect water snowy forest
      "photo-1485738422979", // old incorrect water snowy forest / street
      "photo-1504280390367-361c6d9f38f4", // old camping (sewage)
      "photo-1542060748-10c28b629f6f", // old sewage abstract (sewage)
      "photo-1581056771107-24ca5f033842", // old incorrect sewage chemist/lab
      "photo-1628157582853", // old incorrect sewage laboratory
      "photo-1584622650111-993a426fbf0a", // old dentist (property damage)
      "photo-1589939705384-5185137a7f0f", // old construction (property damage)
      "photo-1473163928189-364b2c4e1135"  // old general road
    ];

    for (const issue of issues) {
      let correctImageUrl = issue.imageUrl;
      let correctResolutionUrl = issue.resolutionImageUrl;
      
      const category = (issue.category || "other").toLowerCase();
      const matchedImage = categoryImages[category] || categoryImages.other;
      const matchesOld = oldPlaceholders.some(p => issue.imageUrl && issue.imageUrl.includes(p));
      
      // Update if the image is missing, holds old/redundant placeholder values, or is the generic pothole image used for a non-pothole issue
      if (
        !issue.imageUrl ||
        matchesOld ||
        (issue.imageUrl.includes("photo-1515162816999-a0c47dc192f7") && category !== "pothole")
      ) {
        correctImageUrl = matchedImage;
      }
      
      // Also correct resolved image for any resolved issues to show a beautiful fixed state
      if (issue.status === "resolved") {
        if (
          !issue.resolutionImageUrl || 
          issue.resolutionImageUrl.includes("picsum") ||
          issue.resolutionImageUrl.includes("photo-1449034446853-66c86144b0ad") || // old suspension bridge
          (issue.resolutionImageUrl.includes("photo-1599740831630") && category !== "pothole" && category !== "water" && category !== "water_leakage")
        ) {
          if (category === "pothole") {
            correctResolutionUrl = "https://images.unsplash.com/photo-1599740831630-d3aa1729b4e5?auto=format&fit=crop&w=800&q=80"; // smooth new road
          } else if (category === "streetlight") {
            correctResolutionUrl = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80"; // beautifully lit cozy streets/lamp
          } else if (category === "garbage") {
            correctResolutionUrl = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"; // clean green park/street
          } else if (category === "water" || category === "water_leakage") {
            correctResolutionUrl = "https://images.unsplash.com/photo-1599740831630-d3aa1729b4e5?auto=format&fit=crop&w=800&q=80"; // dry paved road
          } else {
            correctResolutionUrl = "https://images.unsplash.com/photo-1599740831630-d3aa1729b4e5?auto=format&fit=crop&w=800&q=80"; // clean smooth road
          }
        }
      }

      if (correctImageUrl !== issue.imageUrl || correctResolutionUrl !== issue.resolutionImageUrl) {
        await db.update(issuesTable)
          .set({ imageUrl: correctImageUrl, resolutionImageUrl: correctResolutionUrl })
          .where(eq(issuesTable.id, issue.id));
      }
    }
    logger.info("Checked and updated existing issue images in the database successfully.");
  } catch (error) {
    logger.error({ error }, "Failed to update existing issue images");
  }
}

async function start() {
  await seedDemoData();

  // Clean up any user/demo issues containing "sample" in their title
  try {
    await db.delete(issuesTable).where(ilike(issuesTable.title, "%sample%"));
    logger.info("Cleaned up any existing issues containing 'sample' in their title.");
  } catch (err) {
    logger.error({ err }, "Failed to clean up sample issues");
  }

  await updateExistingIssueImages();

  if (process.env.NODE_ENV !== "production") {
    // In development, serve Vite on the same port
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {},
      },
      appType: "spa",
      root: path.resolve(__dirname, "../../community-hero"),
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built frontend
    const distPath = path.resolve(__dirname, "../../community-hero/dist/public");
    app.use(express.static(distPath));
    app.get(/.*/, (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server listening on port " + port);
  });
}

start().catch(err => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});