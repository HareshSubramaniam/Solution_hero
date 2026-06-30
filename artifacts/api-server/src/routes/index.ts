import { Router } from "express";
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

export default router;