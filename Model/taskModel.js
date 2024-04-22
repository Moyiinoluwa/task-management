const mongoose = require('mongoose')


const taskSchema = mongoose.Schema({
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    deadline: {
        type: Date,
        required: true
    },

    reminder: {
        type: Date,
        default: ''
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Task', taskSchema)