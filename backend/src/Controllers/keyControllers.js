import Project from '../Models/Project.js'
import KeyUsage from '../Models/KeyUsage.js'

export async function getAllKeys(req, res) {
	try {
		const { projectId } = req.query;
		if (projectId) {
			const project = await Project.findById(projectId).select('keys project_name');
			if (!project) return res.status(404).json({ message: 'Project not found' });
			return res.json({ projectId: project._id, project_name: project.project_name, keys: project.keys });
		}

		// If user is authenticated, return keys across their projects
		if (req.user?.id) {
			const projects = await Project.find({ userId: req.user.id }).select('keys project_name');
			const result = projects.map(p => ({ projectId: p._id, project_name: p.project_name, keys: p.keys }));
			return res.json({ projects: result });
		}

		// Fallback: return all keys grouped by project
		const projects = await Project.find().select('keys project_name');
		const result = projects.map(p => ({ projectId: p._id, project_name: p.project_name, keys: p.keys }));
		res.json({ projects: result });
	} catch (error) {
		console.error('Error fetching keys', error);
		res.status(500).json({ message: 'Server error' });
	}
}

export async function getOneKey(req, res) {
	try {
		const { id } = req.params; // id is the key _id
		const project = await Project.findOne({ 'keys._id': id }, { 'keys.$': 1, project_name: 1 });
		if (!project || !project.keys || project.keys.length === 0) return res.status(404).json({ message: 'Key not found' });
		const key = project.keys[0];
		res.json({ projectId: project._id, project_name: project.project_name, key });
	} catch (error) {
		console.error('Error fetching key', error);
		res.status(500).json({ message: 'Server error' });
	}
}

export async function addKey(req, res) {
	try {
		const { projectId, key_name, api_key } = req.body;
		if (!projectId) return res.status(400).json({ message: 'projectId is required' });
		if (!key_name || !api_key) return res.status(400).json({ message: 'key_name and api_key are required' });

		const project = await Project.findById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });

		project.keys.push({ key_name, api_key });
		await project.save();

		const added = project.keys[project.keys.length - 1];
		res.status(201).json({ message: 'Key added', projectId: project._id, key: added });
	} catch (error) {
		console.error('Error adding key', error);
		res.status(500).json({ message: 'Server error' });
	}
}

export async function updateKey(req, res) {
	try {
		const { id } = req.params; // key id
		const { key_name, api_key } = req.body;
		const setObj = {};
		if (key_name !== undefined) setObj['keys.$.key_name'] = key_name;
		if (api_key !== undefined) setObj['keys.$.api_key'] = api_key;

		if (Object.keys(setObj).length === 0) return res.status(400).json({ message: 'No valid fields to update' });

		const updatedProject = await Project.findOneAndUpdate({ 'keys._id': id }, { $set: setObj }, { new: true });
		if (!updatedProject) return res.status(404).json({ message: 'Key not found' });

		const updatedKey = updatedProject.keys.id(id);
		res.json({ message: 'Key updated', projectId: updatedProject._id, key: updatedKey });
	} catch (error) {
		console.error('Error updating key', error);
		res.status(500).json({ message: 'Server error' });
	}
}

export async function deleteKey(req, res) {
	try {
		const { id } = req.params; // key id
		const updatedProject = await Project.findOneAndUpdate({ 'keys._id': id }, { $pull: { keys: { _id: id } } }, { new: true });
		if (!updatedProject) return res.status(404).json({ message: 'Key not found' });
		res.json({ message: 'Key deleted', projectId: updatedProject._id });
	} catch (error) {
		console.error('Error deleting key', error);
		res.status(500).json({ message: 'Server error' });
	}
}

export async function retrieveKey(req, res) {
	try {
		const { access_token, secret_name } = req.body;
		if (!access_token || !secret_name) {
			return res.status(400).json({ message: "access_token and secret_name are required" });
		}

		const project = await Project.findOne({ access_key: access_token });
		if (!project) {
			return res.status(404).json({ message: "Invalid access token" });
		}

		const key = project.keys.find(k => k.key_name === secret_name);
		if (!key) {
			return res.status(404).json({ message: "Secret not found" });
		}

		// Log usage
		await KeyUsage.create({
			projectId: project._id,
			keyName: secret_name
		});

		res.json({ secret_name: key.key_name, api_key: key.api_key });
	} catch (error) {
		console.error("Error retrieving key", error);
		res.status(500).json({ message: "Server error" });
	}
}

export async function getUsageStats(req, res) {
	try {
		const userId = req.user.id;
		// Find all projects for this user
		const projects = await Project.find({ userId }).select('_id');
		const projectIds = projects.map(p => p._id);

		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		// Aggregate usage by hour and key
		const usage = await KeyUsage.aggregate([
			{
				$match: {
					projectId: { $in: projectIds },
					timestamp: { $gte: twentyFourHoursAgo }
				}
			},
			{
				$group: {
					_id: {
						hour: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" } },
						keyName: "$keyName"
					},
					count: { $sum: 1 }
				}
			},
			{ $sort: { "_id.hour": 1 } }
		]);

		// Transform data for the chart: [{ hour: "...", key1: count, key2: count }, ...]
		const transformedData = {};
		const allKeys = new Set();

		usage.forEach(item => {
			const hour = item._id.hour;
			const key = item._id.keyName;
			const count = item.count;

			if (!transformedData[hour]) {
				transformedData[hour] = { name: hour }; // 'name' for X-axis
			}
			transformedData[hour][key] = count;
			allKeys.add(key);
		});

		// Fill in missing hours with 0 for all keys (optional, but good for smooth lines)
		// For simplicity, we'll just return the sparse data, recharts handles it reasonably well,
		// but filling gaps is better. Let's stick to sparse for now to keep it simple, 
		// or we can just return the array.

		const result = Object.values(transformedData).sort((a, b) => a.name.localeCompare(b.name));

		res.json({ usage: result, keys: Array.from(allKeys) });
	} catch (error) {
		console.error("Error fetching usage stats", error);
		res.status(500).json({ message: "Server error" });
	}
}