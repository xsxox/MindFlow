// routes/articles.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { marked } = require('marked'); // [新增] 引入转换工具

// 1. 去写文章页面
router.get('/new', (req, res) => {
    res.render('articles/new');
});

router.get('/search', async (req, res) => {
    const query = req.query.q; // 获取 URL 中的 ?q=关键词
    if (!query) {
        return res.redirect('/');
    }

    try {
        // 使用正则表达式进行模糊匹配 (i表示忽略大小写)
        const articles = await Article.find({
            title: new RegExp(query, 'i') 
        });
        
        // 渲染搜索结果页
        res.render('articles/search', { 
            articles: articles, 
            query: query 
        });
    } catch (e) {
        console.log(e);
        res.redirect('/');
    }
});


// 2. [新增] 文章详情页 (必须放在 /new 下面，否则会冲突)
router.get('/:id', async (req, res) => {
    try {
        // ★★★ [修改] 加上 .populate('author')
        // 它的意思是：去 User 表查这个 author ID，把查到的用户对象替换到 author 字段里
        const article = await Article.findById(req.params.id).populate('author'); 
        
        if (article == null) res.redirect('/');
        
        const htmlContent = marked.parse(article.markdown);
        res.render('articles/show', { article: article, htmlContent: htmlContent });
    } catch (e) {
        console.log(e);
        res.redirect('/');
    }
});

// 3. 保存文章
router.post('/', async (req, res) => {
    // [安全检查] 如果没登录，不能发文章 (防止报错)
    if (!req.session.userId) {
        return res.send("请先登录再发布文章！<a href='/auth/login'>去登录</a>");
    }

    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        author: req.session.userId // ★★★ [新增] 把作者ID存进去
    });

    try {
        article = await article.save();
        res.redirect(`/articles/${article.id}`);
    } catch (e) {
        console.log(e);
        res.render('articles/new', { article: article });
    }
});

module.exports = router;