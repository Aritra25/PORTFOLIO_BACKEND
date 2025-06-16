import express from "express";
import {
    addNewSkill,
    deleteSkill,
    getAllSkills,
    updateSkill
} from "../controllers/skillController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall",isAuthenticated,getAllSkills);
router.delete("/delete/:id",isAuthenticated,deleteSkill);
router.put("/update/:id",isAuthenticated,updateSkill);
router.post("/add",isAuthenticated, addNewSkill);

export default router;