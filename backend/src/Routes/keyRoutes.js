import express from 'express';
import {getAllKeys, getOneKey, addKey, updateKey, deleteKey} from '../Controllers/keyControllers.js';
const router = express.Router();


router.get("/getkeys", getAllKeys);
router.get("/:id", getOneKey)
router.post("/", addKey);
router.delete("/:id", deleteKey)
router.put("/:id", updateKey)

export default router;