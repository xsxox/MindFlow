// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

// --- 引入路由文件 ---
const articleRouter = require('./routes/articles'); // 文章路由
const commentRouter = require('./routes/comments'); // 评论路由
const authRouter = require('./routes/auth');        // 认证路由

// --- 引入模型 ---
const Article = require('./models/Article');

const app = express();

// ================= 1. 数据库连接 =================
mongoose.connect('mongodb://127.0.0.1:27017/mindflow')
    .then(() => console.log('>> 数据库连接成功 (MongoDB Connected)'))
    .catch(err => console.log('!! 数据库连接失败:', err));

// ================= 2. 基础配置 =================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // 静态资源
app.use(express.urlencoded({ extended: false }));        // 解析表单
app.use(express.json());                                 // 解析 Ajax JSON
app.use(methodOverride('_method'));                      // 支持 PUT/DELETE

// ================= 3. Session 配置 =================
app.use(session({
    secret: 'mindflow_secret_key_2026', 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1天
}));

// ================= 4. 全局中间件 (变量注入) =================
app.use((req, res, next) => {
    res.locals.currentUser = req.session.username;
    res.locals.currentUserId = req.session.userId;
    res.locals.isAdmin = (req.session.role === 'admin');
    next();
});

// ================= 5. 核心页面路由 =================

// 首页
app.get('/', async (req, res) => {
    try {
        const articles = await Article.find().populate('author').sort({ createdAt: 'desc' });
        res.render('index', { articles: articles });
    } catch (e) {
        res.render('index', { articles: [] });
    }
});

// ★★★ [修复] 关于页路由 (必须放在 404 之前) ★★★
app.get('/about', (req, res) => {
    res.render('about');
});

// ================= 6. 挂载子路由 =================
app.use('/articles', articleRouter);
app.use('/api/comments', commentRouter);
app.use('/auth', authRouter);

// ================= 7. 404 错误处理 (必须在最后) =================
app.use((req, res) => {
    res.status(404).render('404'); 
});

// ================= 8. 启动服务器 =================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`>> MindFlow 服务器已启动: http://localhost:${PORT}`);
});