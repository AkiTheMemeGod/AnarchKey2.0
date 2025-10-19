import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './utils/db.js';


dotenv.config("./");
const app = express();

app.use(cors({
    origin:"http://localhost:5173"
}));  
app.use(express.json());

app.use("/api/auth", )
app.use("/api/v1/key", );
app.use("/api/v1/project", )

connectDB().then(()=>{
app.listen(5001, () => {
    console.log("Server is running on port: ", 5001);
});
});