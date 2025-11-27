const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    date: {
        type: Date,
        required: [true, 'Please add a date'],
    },
    time: {
        type: String,
    },
    description: {
        type: String,
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
