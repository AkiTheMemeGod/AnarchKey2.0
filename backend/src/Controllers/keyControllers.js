import Project from '../Models/Project.js';
import KeyUsage from '../Models/KeyUsage.js';
import User from '../Models/User.js';
import cache from '../utils/cache.js';

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

export async function bulkAddKeys(req, res) {
	try {
		const { projectId, items } = req.body || {};
		if (!projectId) return res.status(400).json({ message: 'projectId is required' });
		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ message: 'items must be a non-empty array' });
		}

		const project = await Project.findById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });
		// Ownership check (matches the rest of the controllers)
		if (req.user?.id && String(project.userId) !== String(req.user.id)) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const allowedDuplicates = new Set(['add', 'skip', 'overwrite']);
		const result = { imported: 0, overwritten: 0, skipped: 0, errors: [] };

		for (let i = 0; i < items.length; i++) {
			const raw = items[i] || {};
			const key_name = typeof raw.key_name === 'string' ? raw.key_name.trim() : '';
			const api_key = typeof raw.api_key === 'string' ? raw.api_key : '';
			const duplicate = allowedDuplicates.has(raw.duplicate) ? raw.duplicate : 'add';

			if (!key_name || !api_key) {
				result.errors.push({ index: i, message: 'key_name and api_key are required' });
				continue;
			}

			const existingIdx = project.keys.findIndex(k => k.key_name === key_name);
			if (existingIdx >= 0) {
				if (duplicate === 'overwrite') {
					project.keys[existingIdx].api_key = api_key;
					result.overwritten += 1;
				} else {
					// 'skip' or 'add' when a conflict exists: leave existing untouched
					result.skipped += 1;
				}
			} else {
				// No conflict — any duplicate value resolves to "add"
				project.keys.push({ key_name, api_key });
				result.imported += 1;
			}
		}

		if (result.imported > 0 || result.overwritten > 0) {
			await project.save();
			// Bulk mutation — clear the cache to avoid serving stale secret values
			cache.clear();
		}

		res.status(200).json({
			message: 'Bulk import complete',
			projectId: project._id,
			...result,
		});
	} catch (error) {
		console.error('Error bulk adding keys', error);
		res.status(500).json({ message: 'Server error' });
	}
}

export async function retrieveKey(req, res) {
	try {
		const { access_token, secret_name } = req.body;
		if (!access_token || !secret_name) {
			return res.status(400).json({ message: "access_token and secret_name are required" });
		}

		// Also check salt hash coming from the npm package
		const init_token = req.headers['x-anarchkey-init'];
		if (!init_token) {
			return res.status(403).json({ message: "Init token missing. Please run init service." });
		}

		// Cache key: combination of access_token and secret_name and init_token
		const cacheKey = `${access_token}:${secret_name}:${init_token}`;
		const cachedData = cache.get(cacheKey);

		if (cachedData) {
			// Cache Hit
			// Log usage asynchronously (fire-and-forget)
			// We need the projectId for logging. We can store it in the cache or fetch it?
			// To avoid fetching project just for logging, we should cache the projectId too.
			// Let's assume cachedData contains { secret_name, api_key, projectId }

			KeyUsage.create({
				projectId: cachedData.projectId,
				keyName: secret_name
			}).catch(err => console.error("Error logging key usage (cache hit)", err));

			return res.json({ secret_name: cachedData.secret_name, api_key: cachedData.api_key });
		}

		// Cache Miss
		const project = await Project.findOne({ access_key: access_token });
		if (!project) {
			return res.status(404).json({ message: "Invalid access token" });
		}

		const user = await User.findById(project.userId);
		if (!user || user.salt_hash !== init_token) {
			return res.status(403).json({ message: "Invalid init token" });
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

		// Store in cache
		cache.set(cacheKey, {
			secret_name: key.key_name,
			api_key: key.api_key,
			projectId: project._id
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

export async function getUsageLogs(req, res) {
	try {
		const userId = req.user.id;
		// Find all projects for this user
		const projects = await Project.find({ userId }).select('_id');
		const projectIds = projects.map(p => p._id);

		// Fetch recent logs
		const logs = await KeyUsage.find({
			projectId: { $in: projectIds }
		})
			.sort({ timestamp: -1 })
			.limit(50)
			.populate('projectId', 'project_name');

		res.status(200).json(logs);
	} catch (error) {
		console.error("Error fetching usage logs", error);
		res.status(500).json({ message: "Error fetching usage logs", error: error.message });
	}
}