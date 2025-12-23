import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './utils/db.js';

import authRoutes from './Routes/authRoutes.js';
import keyRoutes from './Routes/keyRoutes.js';
import projectRoutes from './Routes/projectRoutes.js';
import sdkRoutes from './Routes/sdkRoutes.js';



const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

app.use("/api/auth", authRoutes)
app.use("/api/v1/key", keyRoutes);
app.use("/api/v1/project", projectRoutes)
app.use("/api/v1/sdk", sdkRoutes);

connectDB().then(() => {
    app.listen(5001, () => {
        console.log("Server is running on port: ", 5001);
    });
});