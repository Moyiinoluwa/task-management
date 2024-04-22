const mongoose = require('mongoose')

const adminOtpSchema = mongoose.Schema({
    otp: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },
    
    expirationTime: {
        type: String,
        required: true
    },

    verified: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
});


module.exports = mongoose.model('Adminotp', adminOtpSchema)