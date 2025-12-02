import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env from project root if present
dotenv.config();

const connectDB = async () => {
    try {
        // Accept either MONGO_URI or MONGODB_URI for flexibility
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MongoDB connection string not set (MONGO_URI or MONGODB_URI)');
        }

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected to', mongoose.connection.name, 'on host', mongoose.connection.host);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message || error);
        process.exit(1);
    }
};

export default connectDB;