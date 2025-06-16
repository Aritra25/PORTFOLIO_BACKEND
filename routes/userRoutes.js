import express from "express";
import {
  forgotPassword,
  getUser,
  getUserForPortfolio,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/userControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);
router.get("/portfolio/me", isAuthenticated, getUserForPortfolio);
router.put("/me/profile/update", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
