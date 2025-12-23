import express from 'express';
import { retrieveKey } from '../Controllers/keyControllers.js';

const router = express.Router();

router.post("/secrets", retrieveKey);

export default router;
