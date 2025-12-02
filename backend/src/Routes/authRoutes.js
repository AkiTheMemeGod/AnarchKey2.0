import express from 'express';
import User from '../Models/User.js';
import { register_User, login_User } from '../Controllers/authControllers.js';
import authMiddleware from '../middleware/authmiddleware.js';
const router = express.Router()

router.post("/register",register_User)
router.post("/login",login_User)
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json(user);
});
export default router; 