// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const multer = require('multer');
const path = require('path');

// === 1. 配置上传 Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// === GET 路由 ===

router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 个人中心页
router.get('/profile', async (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    try {
        const user = await User.findById(req.session.userId);
        const myArticles = await Article.find({ author: req.session.userId }).sort({ createdAt: 'desc' });
        
        let totalLikes = 0;
        myArticles.forEach(article => {
            // article.likes 是一个数组，长度就是点赞数
            totalLikes += article.likes.length;
        });

        // 渲染页面，传入 totalLikes
        res.render('auth/profile', { 
            currentUserObj: user, 
            articles: myArticles,
            totalLikes: totalLikes
        });
    } catch (e) {
        console.log(e);
        res.redirect('/');
    }
});

// === POST 路由 ===

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
        res.send("注册失败：" + e.message);
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username });
        if (user && user.password === password) {
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.role = user.role;
            req.session.bio = user.bio;
            req.session.avatar = user.avatar; // 存入 session
            res.redirect('/');
        } else {
            res.render('auth/login', { error: '用户名或密码错误' });
        }
    } catch (e) {
        res.render('auth/login', { error: '系统错误' });
    }
});

router.post('/update', upload.single('avatar'), async (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    
    try {
        const user = await User.findById(req.session.userId);
        
        // 更新简介
        user.bio = req.body.bio;
        
        if (req.file) {
            user.avatar = '/uploads/' + req.file.filename;
        }
        
        await user.save();
        
        req.session.bio = user.bio;
        req.session.avatar = user.avatar;
        
        res.redirect('/auth/profile');
    } catch (e) {
        console.log(e);
        res.redirect('/auth/profile');
    }
});

module.exports = router;