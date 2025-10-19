import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project_name : {type: String, required: true},
    api_keys : [
          {
            api_key_id: { type: mongoose.Schema.Types.ObjectId, ref: "Key", required: true }
          },
        ],
    },
    {timestamps: true}
);


const Project = mongoose.model("Project", projectSchema);

export default Project;