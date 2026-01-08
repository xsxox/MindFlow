// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'visitor'
    },

    bio: { 
        type: String, 
    },

    avatar: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', userSchema);