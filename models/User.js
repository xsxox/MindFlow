// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // 用户名必须唯一
    },
    password: {
        type: String,
        required: true
    },
    // 可以加一个 isAdmin 字段来区分管理员和普通用户
    role: {
        type: String,
        default: 'visitor' // 默认是访客，管理员可以是 'admin'
    }
});

module.exports = mongoose.model('User', userSchema);