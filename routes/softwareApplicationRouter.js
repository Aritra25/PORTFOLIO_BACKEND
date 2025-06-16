import express from "express";
import {
  addNewApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
} from "../controllers/softwareApplicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall", getAllApplications);
router.delete("/delete/:id", isAuthenticated, deleteApplication);
router.post("/add", isAuthenticated, addNewApplication);

export default router;
