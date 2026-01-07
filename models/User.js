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
    },

    bio: { 
        type: String, 
    },

    avatar: {
        type: String,
        default: '' // 默认为空，前端会处理默认头像
    }
});

module.exports = mongoose.model('User', userSchema);