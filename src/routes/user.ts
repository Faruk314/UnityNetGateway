import express from "express";
import {
  getLoggedUserInfo,
  getUserFriends,
  getUserInfo,
  getUsersByLikes,
  searchUsers,
} from "../controllers/user";
import { protect } from "../utils/protect";
import { upload } from "../utils/upload";

const router = express.Router();

router.get("/getLoggedUserInfo", protect, getLoggedUserInfo);

router.get("/searchUsers", searchUsers);

router.get("/getUserInfo/:id", protect, getUserInfo);

router.get("/getUsersByLikes/:id", protect, getUsersByLikes);

router.get("/getUserFriends/:id", getUserFriends);

export default router;
