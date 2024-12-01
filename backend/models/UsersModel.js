const mongoose = require('mongoose');

// Users Collection Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    created_at:{
        type:Date,
        default: Date.now
    },
    updated_at:{
        type: Date,
        default:Date.now
    }
});

userSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

// Save model
const User = mongoose.model('User',userSchema);
module.exports = User
