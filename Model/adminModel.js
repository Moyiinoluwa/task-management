const mongoose = require('mongoose')


const adminSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'Admin'
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
}, {
    timestamps: true
});



module.exports = mongoose.model('Admin', adminSchema)