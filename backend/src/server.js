import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './utils/db.js';

import authRoutes from './Routes/authRoutes.js';
import keyRoutes from './Routes/keyRoutes.js';
import projectRoutes from './Routes/projectRoutes.js';
import sdkRoutes from './Routes/sdkRoutes.js';
dotenv.config();


const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

app.use("/api/auth", authRoutes)
app.use("/api/v1/key", keyRoutes);
app.use("/api/v1/project", projectRoutes)
app.use("/api/v1/sdk", sdkRoutes);
const port = process.env.PORT
connectDB().then(() => {
    app.listen(port, () => {
        console.log("Server is running on port: ", port);
    });
});