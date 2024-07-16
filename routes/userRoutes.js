import {
  registerUser,
  loginUser,
  onBoardUser,
  changeRole,
  updateProfile,
  getProfile,
  resetPassword
} from "../controllers/userControllers.js";
import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express/index.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/onboard",verifySession(), onBoardUser);
router.post("/changerole", verifySession(), changeRole);
router.get("/getprofile", verifySession(), getProfile);
router.post("/editprofile", verifySession(), updateProfile);
router.post("/resetpassword", verifySession(), resetPassword);

export default router;
