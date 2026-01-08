// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

// --- 引入路由文件 ---
const articleRouter = require('./routes/articles');
const commentRouter = require('./routes/comments'); 
const authRouter = require('./routes/auth');        

// --- 引入模型 ---
const Article = require('./models/Article');

const app = express();

// ================= 1. 数据库连接 =================
mongoose.connect('mongodb://127.0.0.1:27017/mindflow')
    .then(() => console.log('>> 数据库连接成功 (MongoDB Connected)'))
    .catch(err => console.log('!! 数据库连接失败:', err));

// ================= 2. 基础配置 =================
// 设置视图引擎为 EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态资源文件夹 (CSS, JS, 图片)
app.use(express.static(path.join(__dirname, 'public')));

// 解析请求体
app.use(express.urlencoded({ extended: false })); // 处理普通表单
app.use(express.json());                          // 处理 Ajax JSON 数据

// 支持 PUT 和 DELETE 请求 (通过 ?_method=DELETE)
app.use(methodOverride('_method'));

// ================= 3. Session 配置 =================
app.use(session({
    secret: 'mindflow_secret_key_2026', // 密钥
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // Cookie 有效期 1 天
    }
}));

// ================= 4. 全局中间件 =================
// 作用：把 Session 里的用户信息传给所有的 EJS 页面，不用每个路由都写一遍
app.use((req, res, next) => {
    // 1. 当前登录用户名
    res.locals.currentUser = req.session.username;
    
    // 2. 当前登录用户ID (用于判断是否是作者/点赞逻辑)
    res.locals.currentUserId = req.session.userId;
    
    // 3. 是否为管理员 (用于显示红色删除按钮)
    res.locals.isAdmin = (req.session.role === 'admin');

    // 4. 个人简介 (用于侧边栏显示)
    res.locals.currentBio = req.session.bio;

    // 5. 头像 (用于导航栏和侧边栏)
    res.locals.currentAvatar = req.session.avatar;
    
    next();
});

// ================= 5. 首页路由 =================
app.get('/', async (req, res) => {
    try {
        // 1. 查询所有文章
        // .populate('author') 把 author ID 变成具体的作者对象
        const articles = await Article.find()
                                      .populate('author')
                                      .sort({ createdAt: 'desc' });
        
        // 2. 计算当前登录用户的“获赞总量” (用于侧边栏显示)
        let totalLikesReceived = 0;
        if (req.session.userId) {
            // 查我自己写的所有文章
            const myArticles = await Article.find({ author: req.session.userId });
            // 累加每篇文章的点赞数
            myArticles.forEach(article => {
                totalLikesReceived += article.likes.length;
            });
        }
        
        // 3. 渲染页面
        res.render('index', { 
            articles: articles,
            totalLikesReceived: totalLikesReceived // 传给前端显示
        });

    } catch (e) {
        console.log(e);
        res.render('index', { articles: [], totalLikesReceived: 0 }); // 报错时显示空列表
    }
});

// ================= 6. 其他页面路由 =================

app.get('/about', (req, res) => {
    res.render('about');
});

// ================= 7. 挂载子路由 =================
app.use('/articles', articleRouter); 
app.use('/api/comments', commentRouter);
app.use('/auth', authRouter);            

// ================= 8. 404 错误处理 =================
app.use((req, res) => {
    res.status(404).render('404');
});

// ================= 9. 启动服务器 =================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`>> MindFlow 服务器已启动: http://localhost:${PORT}`);
});