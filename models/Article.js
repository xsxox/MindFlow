// models/Article.js
const mongoose = require('mongoose');

// 定义文章的Schema
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // 标题必填
    },
    description: {
        type: String // 文章简介
    },
    markdown: {
        type: String,
        required: true // 文章正文
    },
    createdAt: {
        type: Date,
        default: Date.now // 创建时间，默认当前
    },
    // 封面图路径
    coverImage: {
        type: String, 
        default: '' 
    }
});

// 导出模型
module.exports = mongoose.model('Article', articleSchema);