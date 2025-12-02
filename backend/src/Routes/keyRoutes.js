import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';
import {getAllKeys, getOneKey, addKey, updateKey, deleteKey} from '../Controllers/keyControllers.js';
const router = express.Router();


router.get("/getkeys", authMiddleware, getAllKeys);
router.get("/:id", authMiddleware, getOneKey)
router.post("/", authMiddleware, addKey);
router.delete("/:id", authMiddleware, deleteKey)
router.put("/:id", authMiddleware, updateKey)

export default router;