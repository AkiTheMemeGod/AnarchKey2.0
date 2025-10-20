import express from 'express';

import {getAllProjects, getOneProject, addProject, deleteProject, updateProject} from '../Controllers/projectControllers.js'
const router = express.Router();


router.get("/getprojects", getAllProjects);
router.get("/:id", getOneProject)
router.post("/", addProject);
router.delete("/:id", deleteProject)
router.put("/:id", updateProject)

export default router;