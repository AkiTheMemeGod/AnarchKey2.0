// backend/src/config/index.js
import dotenv from 'dotenv';

// load env file (use object form)
dotenv.config({ path: '/home/theseus/Projects/AnarchKey2.0/backend/.env' });

const config = {
  mongoUri:  process.env.MONGO_URI,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
}
export default config;
