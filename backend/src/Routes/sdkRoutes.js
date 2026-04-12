import express from 'express';
import { retrieveKey } from '../Controllers/keyControllers.js';
import { initService } from '../Controllers/authControllers.js';

const router = express.Router();

import { sdkRateLimiter } from '../middleware/rateLimiter.js';

router.post("/secrets", sdkRateLimiter, retrieveKey);
router.post("/anarchkey_init", initService);

export default router;
