const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

// --- 引入路由文件 ---
const articleRouter = require('./routes/articles'); // 文章路由
const commentRouter = require('./routes/comments'); // [新] 评论路由
const Article = require('./models/Article');        // 数据库模型

const app = express();

// --- 1. 数据库连接 ---
mongoose.connect('mongodb://127.0.0.1:27017/mindflow')
    .then(() => console.log('>> 数据库连接成功'))
    .catch(err => console.log(err));

// --- 2. 基础配置 ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false })); // 处理表单提交
app.use(express.json());                          // [新] 处理 Ajax JSON 提交
app.use(methodOverride('_method'));

// --- 3. 首页路由 ---
app.get('/', async (req, res) => {
    // 查所有文章，按时间倒序
    const articles = await Article.find().sort({ createdAt: 'desc' });
    res.render('index', { articles: articles });
});

// --- 4. 挂载路由 ---
app.use('/articles', articleRouter);     // 处理文章页面
app.use('/api/comments', commentRouter); // [新] 处理评论 Ajax 接口

// --- 5. 启动服务器 ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`>> 服务器启动成功: http://localhost:${PORT}`);
});