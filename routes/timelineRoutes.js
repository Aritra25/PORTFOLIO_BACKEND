import express from "express";
import {
  getAllTimelines,
  deleteTimeline,
  postTimeline,
} from "../controllers/timelineController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, postTimeline);
router.delete("/delete/:id", isAuthenticated, deleteTimeline);
router.get("/getall", isAuthenticated, getAllTimelines);

export default router;
