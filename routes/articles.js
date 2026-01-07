// routes/articles.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { marked } = require('marked'); // [新增] 引入转换工具

// 1. 去写文章页面
router.get('/new', (req, res) => {
    res.render('articles/new');
});

// 2. [新增] 文章详情页 (必须放在 /new 下面，否则会冲突)
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (article == null) res.redirect('/');
        
        // 把 Markdown 转换成 HTML
        const htmlContent = marked.parse(article.markdown);
        
        // 渲染 show.ejs，并传过去文章数据和转换后的HTML
        res.render('articles/show', { 
            article: article,
            htmlContent: htmlContent 
        });
    } catch (e) {
        console.log(e); // 如果ID格式不对，回首页
        res.redirect('/');
    }
});

// 3. 保存文章
router.post('/', async (req, res) => {
    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown
    });
    try {
        article = await article.save();
        // 保存成功后，直接跳转到详情页看效果
        res.redirect(`/articles/${article.id}`);
    } catch (e) {
        res.render('articles/new', { article: article });
    }
});

module.exports = router;