// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// 1. 获取某篇文章的所有评论
router.get('/', async (req, res) => {
    try {
        const articleId = req.query.articleId;
        // 查库，并按时间倒序
        const comments = await Comment.find({ article: articleId }).sort({ createdAt: -1 });
        res.json(comments); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. 提交新评论
router.post('/', async (req, res) => {
    const comment = new Comment({
        content: req.body.content,
        article: req.body.articleId
    });
    try {
        const newComment = await comment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;