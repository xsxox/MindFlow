// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article'); // ★★★ 关键：必须引入文章模型

// 1. 显示注册页
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// 2. 处理注册
router.post('/register', async (req, res) => {
    try {
        // ★★★ [修改] 判断：如果用户名是 admin，角色设为 'admin'，否则是 'visitor'
        const role = (req.body.username === 'admin') ? 'admin' : 'visitor';

        const user = new User({
            username: req.body.username,
            password: req.body.password,
            role: role // 写入数据库
        });
        await user.save();
        res.redirect('/auth/login');
    } catch (e) {
        res.send("注册失败：" + e.message);
    }
});

// 3. 显示登录页
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// 4. 处理登录
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    
    if (user && user.password === password) {
        req.session.userId = user._id;
        req.session.username = user.username;
        // ★★★ [新增] 把角色 role 也存进 session
        req.session.role = user.role; 
        
        res.redirect('/');
    } else {
        res.send("登录失败 <a href='/auth/login'>重试</a>");
    }
});

// 5. 退出登录
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 6. ★★★ 个人中心路由 (你之前可能漏了这个) ★★★
router.get('/profile', async (req, res) => {
    // 如果没登录，不允许访问
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        // 查找当前用户写的所有文章
        const myArticles = await Article.find({ author: req.session.userId })
                                        .sort({ createdAt: 'desc' });
        
        // 渲染 profile 页面
        res.render('auth/profile', { articles: myArticles });
    } catch (e) {
        console.log(e);
        res.redirect('/');
    }
});

module.exports = router;