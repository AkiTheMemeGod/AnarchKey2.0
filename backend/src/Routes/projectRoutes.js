import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';

import {getAllProjects, getOneProject, addProject, deleteProject, updateProject} from '../Controllers/projectControllers.js'
const router = express.Router();


router.get("/getprojects", authMiddleware, getAllProjects);
router.get("/:id", authMiddleware, getOneProject)
router.post("/", authMiddleware, addProject);
router.delete("/:id", authMiddleware, deleteProject)
router.put("/:id", authMiddleware, updateProject)

export default router;