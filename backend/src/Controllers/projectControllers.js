import Project from '../Models/Project.js'
import { generateApiKey } from '../utils/generators.js'

export async function getAllProjects(req, res) {
	try {
		// Prefer authenticated user id, then query param, else return all
		const userId = req.user?.id || req.query.userId;
		const filter = userId ? { userId } : {};
		const projects = await Project.find(filter).sort({ createdAt: -1 });
		res.json({ projects });
	} catch (error) {
		console.error("Error fetching projects", error);
		res.status(500).json({ message: "Server error" });
	}
}
export async function getOneProject(req, res) {
	try {
		const { id } = req.params;
		const project = await Project.findById(id);
		if (!project) return res.status(404).json({ message: "Project not found" });
		res.json({ project });
	} catch (error) {
		console.error("Error fetching project", error);
		res.status(500).json({ message: "Server error" });
	}
}
export async function addProject(req, res) {
	try {
		const userId = req.user?.id || req.body.userId;
		const { project_name, keys } = req.body;

		if (!userId) return res.status(400).json({ message: "userId is required" });
		if (!project_name) return res.status(400).json({ message: "project_name is required" });

		const newProject = new Project({ userId, project_name, keys: Array.isArray(keys) ? keys : [], access_key: generateApiKey() });
		await newProject.save();
		res.status(201).json({ message: "Project created", project: newProject });
	} catch (error) {
		console.error("Error creating project", error);
		res.status(500).json({ message: "Server error" });
	}
}
export async function updateProject(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const updated = await Project.findByIdAndUpdate(id, updates, { new: true });
		if (!updated) return res.status(404).json({ message: "Project not found" });
		res.json({ message: "Project updated", project: updated });
	} catch (error) {
		console.error("Error updating project", error);
		res.status(500).json({ message: "Server error" });
	}
}
export async function deleteProject(req, res) {
	try {
		const { id } = req.params;
		const deleted = await Project.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ message: "Project not found" });
		res.json({ message: "Project deleted" });
	} catch (error) {
		console.error("Error deleting project", error);
		res.status(500).json({ message: "Server error" });
	}
}
