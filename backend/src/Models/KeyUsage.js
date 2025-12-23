import mongoose from 'mongoose';

const keyUsageSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    keyName: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const KeyUsage = mongoose.model('KeyUsage', keyUsageSchema);
export default KeyUsage;
