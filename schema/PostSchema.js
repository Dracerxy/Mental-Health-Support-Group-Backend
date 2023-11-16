const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    selectedFile: String,
    likes: { type: [String], default: [] },
    comments: [{
        text: String,
        userName: String,
        email:String,
        createdAt: {
            type: Date,
            default: new Date(),
        }
    }],
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

const PostMessage = mongoose.model('PostMessage', postSchema);

module.exports = PostMessage;