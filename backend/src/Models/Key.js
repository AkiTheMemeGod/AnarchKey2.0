import mongoose from 'mongoose';

const keySchema = mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectID : {type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    api_key : {type: String, required: true},
},
{timestamps  : true}
);


const Key = mongoose.model("Key", keySchema);

export default Key;