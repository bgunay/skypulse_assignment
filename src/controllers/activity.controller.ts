import { Router } from "express";
import { HttpError } from "../lib/http-error";
import { getActivityScore } from "../services/activity.service";

const router = Router();

router.get("/activity-score", async (req, res, next) => {
  try {
    const { lat, lon, user_id } = req.query;

    if (!lat || !lon) {
      throw new HttpError(400, "lat and lon are required");
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      throw new HttpError(400, "lat and lon must be numbers");
    }

    const result = await getActivityScore(latNum, lonNum, user_id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
