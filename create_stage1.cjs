const fs = require('fs');
const path = require('path');

const files = {
  "package.json": `{
  "name": "workspace",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "preinstall": "sh -c 'rm -f package-lock.json yarn.lock; case \\"$$npm_config_user_agent\\" in pnpm/*) ;; *) echo \\"Use pnpm instead\\" >&2; exit 1 ;; esac'",
    "build": "pnpm run typecheck && pnpm -r --if-present run build",
    "typecheck:libs": "tsc --build",
    "typecheck": "pnpm run typecheck:libs && pnpm -r --filter \\"./artifacts/**\\" --filter \\"./scripts\\" --if-present run typecheck",
    "dev": "concurrently \\"pnpm --filter @workspace/api-server run dev\\" \\"pnpm --filter @workspace/community-hero run dev\\"",
    "start": "pnpm --filter @workspace/api-server run start"
  },
  "private": true,
  "devDependencies": {
    "prettier": "^3.8.4",
    "typescript": "~5.9.3",
    "concurrently": "^8.2.2"
  }
}`,
  "pnpm-workspace.yaml": `minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  - '@replit/*'
  - stripe-replit-sync
packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
catalog:
  '@replit/vite-plugin-cartographer': ^0.5.21
  '@replit/vite-plugin-dev-banner': ^0.1.1
  '@replit/vite-plugin-runtime-error-modal': ^0.0.6
  '@tailwindcss/vite': ^4.1.14
  '@tanstack/react-query': ^5.90.21
  '@types/node': ^25.3.3
  '@types/react': ^19.2.0
  '@types/react-dom': ^19.2.0
  '@vitejs/plugin-react': ^5.0.4
  class-variance-authority: ^0.7.1
  clsx: ^2.1.1
  drizzle-orm: ^0.45.2
  framer-motion: ^12.23.24
  lucide-react: ^0.545.0
  react: 19.1.0
  react-dom: 19.1.0
  tailwind-merge: ^3.3.1
  tailwindcss: ^4.1.14
  tsx: ^4.21.0
  vite: ^7.3.2
  wouter: ^3.3.5
  zod: ^3.25.76
autoInstallPeers: false
onlyBuiltDependencies:
  - '@swc/core'
  - esbuild
  - msw
  - unrs-resolver
overrides:
  "@esbuild-kit/esm-loader": "npm:tsx@^4.21.0"
  esbuild: "0.27.3"
`,
  "tsconfig.json": `{
  "extends": "./tsconfig.base.json",
  "compileOnSave": false,
  "files": [],
  "references": [
    { "path": "./lib/db" },
    { "path": "./lib/api-client-react" },
    { "path": "./lib/api-zod" }
  ]
}`,
  "tsconfig.base.json": `{
  "compilerOptions": {
    "incremental": true,
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": false,
    "noImplicitReturns": true,
    "noUnusedLocals": false,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": false,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "skipLibCheck": true,
    "target": "es2022",
    "types": [],
    "customConditions": ["workspace"]
  }
}`,
  "replit.md": `# CommunityHero`,
  "artifacts/api-server/package.json": `{
  "name": "@workspace/api-server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "export NODE_ENV=development && pnpm run build && pnpm run start",
    "build": "node ./build.mjs",
    "start": "node --enable-source-maps ./dist/index.mjs",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.105.0",
    "@workspace/api-zod": "workspace:*",
    "@workspace/db": "workspace:*",
    "bcryptjs": "^3.0.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "drizzle-orm": "catalog:",
    "express": "^5.2.1",
    "express-session": "^1.19.0",
    "pino": "^9.14.0",
    "pino-http": "^10.5.0",
    "uuid": "^14.0.1",
    "http-proxy-middleware": "^3.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^3.0.0",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/express-session": "^1.19.0",
    "@types/node": "catalog:",
    "@types/uuid": "^11.0.0",
    "esbuild": "0.27.3",
    "esbuild-plugin-pino": "^2.3.3",
    "pino-pretty": "^13.1.3",
    "thread-stream": "3.1.0",
    "vite": "catalog:"
  }
}`,
  "artifacts/api-server/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"],
  "references": [
    { "path": "../../lib/db" },
    { "path": "../../lib/api-zod" }
  ]
}`,
  "artifacts/api-server/build.mjs": `import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);
const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: [
      "*.node",
      "vite",
      "bcrypt",
      "better-sqlite3",
      "sqlite3",
      "pino-pretty",
      "thread-stream"
    ],
    sourcemap: "linked",
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    banner: {
      js: \`import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);\`
    },
  });
}
buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});`,
  "artifacts/api-server/src/app.ts": `import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const sessionSecret = process.env.SESSION_SECRET ?? "communityhero-dev-secret-change-in-production";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;`,
  "artifacts/api-server/src/index.ts": `import app from "./app.js";
import { logger } from "./lib/logger.js";
import path from "path";
import express from "express";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

async function start() {
  if (process.env.NODE_ENV !== "production") {
    // In development, serve Vite on the same port
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, "../../community-hero"),
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built frontend
    const distPath = path.resolve(__dirname, "../../community-hero/dist/public");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
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
});`,
  "artifacts/api-server/src/lib/logger.ts": `import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});`,
  "artifacts/api-server/src/routes/ai.ts": `import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db, issuesTable } from "@workspace/db";
import { sql, ne } from "drizzle-orm";

const router = Router();

let insightsCache: { insights: string[]; generatedAt: string } | null = null;
let insightsCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

router.post("/ai/categorize", async (req, res): Promise<void> => {
  try {
    const { imageBase64, description } = req.body as { imageBase64?: string; description: string };
    const client = getClient();
    if (!client) {
      res.json({
        category: "other",
        severity: "medium",
        confidence: 0,
        tags: [],
        descriptionSuggestion: description,
        error: "AI categorization unavailable",
      });
      return;
    }

    const contentParts: Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> = [];

    if (imageBase64) {
      const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      const mediaType: any = imageBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
      contentParts.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64Data },
      });
    }

    contentParts.push({
      type: "text",
      text: \`Analyze this civic issue report and categorize it. Description: "\${description || "No description provided"}"\nRespond ONLY with valid JSON.\n{"category": "pothole", "severity": "medium", "confidence": 0.9, "tags": ["tag1"], "descriptionSuggestion": "desc"}\`,
    });

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 512,
      system: "You are a civic issue classifier. Respond ONLY with valid JSON.",
      messages: [{ role: "user", content: contentParts }],
    });

    const text = (response.content[0] as Anthropic.TextBlock).text.trim();
    const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    res.json({ ...JSON.parse(jsonStr), error: null });
  } catch (err) {
    res.json({ category: "other", severity: "medium", confidence: 0, tags: [], descriptionSuggestion: req.body.description ?? "", error: "AI failed" });
  }
});

router.post("/ai/check-duplicate", async (req, res): Promise<void> => {
  res.json({ isDuplicate: false, matchedIssueId: null, confidence: 0 });
});

router.get("/ai/insights", async (req, res): Promise<void> => {
  res.json({
    insights: ["Garbage issues are frequent.", "Zone 3 has potholes."],
    generatedAt: new Date().toISOString(),
  });
});

router.post("/ai/chat", async (req, res): Promise<void> => {
  res.json({ reply: "I'm CivicBot! How can I help you?" });
});

export default router;`,
  "artifacts/api-server/src/routes/auth.ts": `import { Router } from "express";
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
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) { res.status(401).json({ error: "Invalid credentials" }); return; }
    req.session.userId = user.id;
    const { passwordHash: _ph, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
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

export default router;`,
  "artifacts/api-server/src/routes/dashboard.ts": `import { Router } from "express";
import { db, issuesTable, usersTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  try {
    res.json({
      totalIssues: 0, resolvedIssues: 0, activeReporters: 0, resolutionRate: 0, avgResolutionDays: 0,
      byCategory: [], byStatus: [], bySeverity: [], byZone: [], recentResolutions: [],
    });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

export default router;`,
  "artifacts/api-server/src/routes/geocode.ts": `import { Router } from "express";

const router = Router();

router.get("/geocode/reverse", async (req, res): Promise<void> => {
  res.json({ address: \`\${req.query.lat}, \${req.query.lon}\`, displayName: "Location" });
});

export default router;`,
  "artifacts/api-server/src/routes/health.ts": `import { Router } from "express";

const router = Router();
router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
export default router;`,
  "artifacts/api-server/src/routes/index.ts": `import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import issuesRouter from "./issues.js";
import usersRouter from "./users.js";
import leaderboardRouter from "./leaderboard.js";
import dashboardRouter from "./dashboard.js";
import geocodeRouter from "./geocode.js";
import aiRouter from "./ai.js";

const router = Router();
router.use(healthRouter);
router.use(authRouter);
router.use(issuesRouter);
router.use(usersRouter);
router.use(leaderboardRouter);
router.use(dashboardRouter);
router.use(geocodeRouter);
router.use(aiRouter);

export default router;`,
  "artifacts/api-server/src/routes/issues.ts": `import { Router } from "express";
import { randomUUID } from "crypto";
import { db, usersTable, issuesTable, statusHistoryTable, commentsTable, activityLogTable } from "@workspace/db";
import { eq, sql, and, ilike } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  next();
}

router.get("/issues", async (req, res): Promise<void> => {
  const results = await db.select().from(issuesTable).orderBy(sql\`\${issuesTable.createdAt} DESC\`);
  res.json(results.map(i => ({ ...i, reporterName: "Unknown", reporterAvatarColor: "#000" })));
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
  res.json({});
});

router.post("/issues/:id/verify", requireAuth, async (req, res): Promise<void> => {
  res.json({ verifiedCount: 1, pointsEarned: 5 });
});

router.post("/issues/:id/comments", requireAuth, async (req, res): Promise<void> => {
  res.json({});
});

export default router;`,
  "artifacts/api-server/src/routes/leaderboard.ts": `import { Router } from "express";
const router = Router();
router.get("/leaderboard", async (req, res): Promise<void> => { res.json([]); });
export default router;`,
  "artifacts/api-server/src/routes/users.ts": `import { Router } from "express";
const router = Router();
router.get("/users/:id", async (req, res): Promise<void> => { res.json({}); });
router.get("/users/:id/activity", async (req, res): Promise<void> => { res.json([]); });
export default router;`
};

for (const [p, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
console.log("Stage 1 files created.");
