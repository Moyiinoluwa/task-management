const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true, 'username taken']
    },

    email: {
        type: String,
        required: true,
        unique: [true, 'email already exist']
    },

    password: {
        type: String,
        required: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isLoggedIn: {
        type: Boolean,
        default: false
    },

    isLoggedOut: {
        type: Boolean,
        default: false
    },

    isPasswordResetLinkSent: {
        type: Boolean,
        default: false
    },

    resetLinkExiprationTime: {
        type: Date
    },

    resetLink: {
        type: String,
        default: ''
    },

    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },

}, {
    timestamps: true
});



module.exports = mongoose.model('User', userSchema)