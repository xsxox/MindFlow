// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); // 引入 Session
const methodOverride = require('method-override');
const path = require('path');

// --- 引入路由文件 ---
const articleRouter = require('./routes/articles'); // 文章路由
const commentRouter = require('./routes/comments'); // 评论路由 (Ajax)
const authRouter = require('./routes/auth');        // 认证路由 (登录注册)
const Article = require('./models/Article');        // 首页需要查文章

const app = express();

// --- 1. 数据库连接 ---
mongoose.connect('mongodb://127.0.0.1:27017/mindflow')
    .then(() => console.log('>> 数据库连接成功'))
    .catch(err => console.log('!! 数据库连接失败:', err));

// --- 2. 基础配置 ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'))); // 静态资源
app.use(express.urlencoded({ extended: false }));        // 解析表单数据
app.use(express.json());                                 // 解析 JSON 数据 (Ajax用)
app.use(methodOverride('_method'));                      // 支持 PUT/DELETE

// --- 3. Session 配置 (必须在路由之前) ---
app.use(session({
    secret: 'mindflow_secret_key', // 用于加密 Session 的密钥，随便写
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // Cookie 有效期 1 天
    }
}));

// --- 4. 全局中间件：让所有页面都能读取 currentUser ---
app.use((req, res, next) => {
    // 把 session 里的用户名赋值给本地变量，这样在 EJS 里就能直接用 <%= currentUser %> 了
    res.locals.currentUser = req.session.username; 
    res.locals.currentUserId = req.session.userId;
    next();
});

// --- 5. 首页路由 ---
app.get('/', async (req, res) => {
    const articles = await Article.find().populate('author').sort({ createdAt: 'desc' });
    res.render('index', { articles: articles });
});
// --- 6. 挂载子路由 ---
app.use('/articles', articleRouter);     // 文章相关: /articles/...
app.use('/api/comments', commentRouter); // 评论API: /api/comments/...
app.use('/auth', authRouter);            // 认证相关: /auth/login, /auth/register

// --- 7. 启动服务器 ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`>> 服务器启动成功: http://localhost:${PORT}`);
});