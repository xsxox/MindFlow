// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    // 关联到具体的文章ID
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);