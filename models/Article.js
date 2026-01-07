// models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // ★★★ [关键修复] 你之前漏掉了这段代码 ★★★
    author: {
        type: mongoose.Schema.Types.ObjectId, // 存储的是用户的 ID
        ref: 'User'                           // 告诉 Mongoose 关联到 'User' 模型
    },
    
    cover: {
        type: String,
        default: null // 默认为空，表示没传图片
    },

    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ]
});

module.exports = mongoose.model('Article', articleSchema);