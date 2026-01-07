// routes/articles.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { marked } = require('marked');
const multer = require('multer'); // [新增] 引入上传工具
const path = require('path');

// ================= 配置 Multer (上传设置) =================
const storage = multer.diskStorage({
    // 指定上传文件存在哪里
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); 
    },
    // 给文件起个唯一的名字 (时间戳 + 后缀名)
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ================= GET 路由 =================

// 1. 搜索
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');
    try {
        const articles = await Article.find({ title: new RegExp(query, 'i') });
        res.render('articles/search', { articles: articles, query: query });
    } catch (e) {
        res.redirect('/');
    }
});

// 2. 新建文章页
router.get('/new', (req, res) => {
    res.render('articles/new');
});

// 3. 编辑文章页
router.get('/edit/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (req.session.role !== 'admin' && article.author.toString() !== req.session.userId) {
            return res.send('无权编辑');
        }
        res.render('articles/edit', { article: article });
    } catch (e) {
        res.redirect('/');
    }
});

// 4. 详情页
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('author');
        if (!article) return res.redirect('/');
        const htmlContent = marked.parse(article.markdown);
        res.render('articles/show', { article: article, htmlContent: htmlContent });
    } catch (e) {
        res.redirect('/');
    }
});

// ================= POST/PUT/DELETE 路由 =================

// 5. ★★★ [关键修改] 发布文章 (支持文件上传) ★★★
// upload.single('cover') 表示接收一个 name="cover" 的文件
router.post('/', upload.single('cover'), async (req, res) => {
    if (!req.session.userId) return res.send("请先登录！");

    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        author: req.session.userId,
        // 如果上传了文件，就存路径；否则存 null
        cover: req.file ? '/uploads/' + req.file.filename : null
    });

    try {
        article = await article.save();
        res.redirect(`/articles/${article.id}`);
    } catch (e) {
        console.log(e);
        res.render('articles/new', { article: article });
    }
});

// 6. 更新文章 (暂时不处理图片更新，为了简化作业)
router.put('/:id', async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;
        await article.save();
        res.redirect(`/articles/${article.id}`);
    } catch (e) {
        res.redirect('/');
    }
});

// 7. 删除文章
router.delete('/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.redirect('/'); 
    } catch (e) {
        res.redirect('/');
    }
});

router.post('/:id/like', async (req, res) => {
    // 1. 如果没登录，返回 401 错误
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
    }

    try {
        const article = await Article.findById(req.params.id);
        const userId = req.session.userId;

        // 2. 检查用户是否已经点过赞
        const index = article.likes.indexOf(userId);

        if (index === -1) {
            // 没点过 -> 添加 ID (点赞)
            article.likes.push(userId);
        } else {
            // 点过了 -> 移除 ID (取消赞)
            article.likes.splice(index, 1);
        }

        await article.save();

        // 3. 返回最新的点赞数
        res.json({ success: true, likesCount: article.likes.length });
    } catch (e) {
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});


module.exports = router;