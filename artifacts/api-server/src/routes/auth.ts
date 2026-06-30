import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const AVATAR_COLORS = ["#2563EB", "#F97316", "#16A34A"];

declare module "express-session" {
  interface SessionData { userId?: string; }
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) { res.status(400).json({ error: "Email taken" }); return; }
    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const [user] = await db.insert(usersTable).values({
      id, name, email, passwordHash, role: role === "admin" ? "admin" : "citizen", avatarColor: AVATAR_COLORS[0], points: 0, badges: [],
    }).returning();
    req.session.userId = user.id;
    const { passwordHash: _ph, ...safeUser } = user;
    res.status(201).json({ user: safeUser });
  } catch (err) {
    console.error("Signup err:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    
    // Auto-create demo users if they don't exist
    if (!user && email.startsWith("demo-") && password === "demo123") {
      const passwordHash = await bcrypt.hash(password, 10);
      const role = email.includes("admin") ? "admin" : "citizen";
      const name = role === "admin" ? "Demo Admin" : "Demo Citizen";
      const [newUser] = await db.insert(usersTable).values({
        id: randomUUID(), name, email, passwordHash, role, avatarColor: AVATAR_COLORS[0], points: 0, badges: [],
      }).returning();
      user = newUser;
    }

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) { res.status(401).json({ error: "Invalid credentials" }); return; }
    req.session.userId = user.id;
    const { passwordHash: _ph, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Login err:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

router.get("/auth/me", async (req, res): Promise<void> => {
  try {
    const userId = req.session.userId;
    if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    const { passwordHash: _ph, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) { res.status(500).json({ error: "Internal error" }); }
});

export default router;