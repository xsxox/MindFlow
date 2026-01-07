// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');

// 1. 显示注册页
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// 2. 处理注册请求
router.post('/register', async (req, res) => {
    try {
        // 创建新用户
        const user = new User({
            username: req.body.username,
            password: req.body.password // ⚠️ 注意：实际项目中这里必须加密(Hash)，但为了作业简单演示，先存明文
        });
        await user.save();
        res.redirect('/auth/login'); // 注册成功，去登录
    } catch (e) {
        res.send("注册失败（用户名可能已存在）：" + e.message);
    }
});

// 3. 显示登录页
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// 4. 处理登录请求 (Session 核心点)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // 查数据库
    const user = await User.findOne({ username: username });
    
    // 验证密码
    if (user && user.password === password) {
        // ★关键★：登录成功，把用户信息存入 Session
        req.session.userId = user._id;
        req.session.username = user.username;
        
        res.redirect('/'); // 回到首页
    } else {
        res.send("登录失败：用户名或密码错误 <a href='/auth/login'>重试</a>");
    }
});

// 5. 退出登录
router.get('/logout', (req, res) => {
    req.session.destroy(); // 销毁 Session
    res.redirect('/');
});

module.exports = router;