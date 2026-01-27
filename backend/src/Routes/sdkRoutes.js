import express from 'express';
import { retrieveKey } from '../Controllers/keyControllers.js';

const router = express.Router();

import { sdkRateLimiter } from '../middleware/rateLimiter.js';

router.post("/secrets", sdkRateLimiter, retrieveKey);

export default router;
