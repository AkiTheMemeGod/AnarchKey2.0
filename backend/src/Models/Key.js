import mongoose from 'mongoose';

const keySchema = mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project_name : {type : String , required : true},
    api_key : {type: String, required: true},
});


const Key = mongoose.model("Key", keySchema);

export default Key;