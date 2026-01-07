// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');

// 1. 显示注册页
router.get('/register', (req, res) => {
    // 注册页也可能会用到 error 逻辑，为了保险，我们暂时也传个 null，或者你还没改注册页就不用管
    res.render('auth/register', { error: null }); 
});

// 2. 处理注册
router.post('/register', async (req, res) => {
    try {
        const role = (req.body.username === 'admin') ? 'admin' : 'visitor';
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            role: role
        });
        await user.save();
        res.redirect('/auth/login');
    } catch (e) {
        // 如果注册失败，也可以像登录一样返回错误信息
        res.send("注册失败：" + e.message); 
    }
});

// 3. ★★★ [关键修复] 显示登录页 ★★★
router.get('/login', (req, res) => {
    // 必须传 { error: null }，否则 login.ejs 会报 "error is not defined"
    res.render('auth/login', { error: null });
});

// 4. 处理登录
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username });
        
        if (user && user.password === password) {
            // 登录成功
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.role = user.role;
            res.redirect('/');
        } else {
            // ★★★ 登录失败：传具体的错误信息 ★★★
            res.render('auth/login', { error: '用户名或密码错误，请检查！' });
        }
    } catch (e) {
        res.render('auth/login', { error: '系统错误：' + e.message });
    }
});

// 5. 退出登录
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 6. 个人中心
router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    try {
        const myArticles = await Article.find({ author: req.session.userId }).sort({ createdAt: 'desc' });
        res.render('auth/profile', { articles: myArticles });
    } catch (e) {
        res.redirect('/');
    }
});

module.exports = router;