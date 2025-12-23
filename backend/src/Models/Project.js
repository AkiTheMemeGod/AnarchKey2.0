import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project_name: { type: String, required: true },
    keys: {
        type: [
            {
                key_name: { type: String, required: true },
                api_key: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        required: false,
        default: []
    },
    access_key: { type: String, required: true }
},
    { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;