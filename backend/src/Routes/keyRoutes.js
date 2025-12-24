import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';
import { getAllKeys, getOneKey, addKey, updateKey, deleteKey, getUsageStats, getUsageLogs } from '../Controllers/keyControllers.js';
const router = express.Router();


router.get("/getkeys", authMiddleware, getAllKeys);
router.get("/usage", authMiddleware, getUsageStats);
router.get("/logs", authMiddleware, getUsageLogs);
router.get("/:id", authMiddleware, getOneKey)
router.post("/", authMiddleware, addKey);
router.delete("/:id", authMiddleware, deleteKey)
router.put("/:id", authMiddleware, updateKey)

export default router;