import { Router } from "express";

const router = Router();

router.get("/geocode/reverse", async (req, res): Promise<void> => {
  res.json({ address: `${req.query.lat}, ${req.query.lon}`, displayName: "Location" });
});

export default router;