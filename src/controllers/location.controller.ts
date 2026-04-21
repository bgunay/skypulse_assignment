import { Router } from "express";
import { getLocations } from "../db/db";

const router = Router();

router.get("/locations", async (_req, res, next) => {
  try {
    const locations = await getLocations();
    res.json({ locations });
  } catch (err) {
    next(err);
  }
});

export default router;
