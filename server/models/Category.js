const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
    },
    color: {
        type: String,
        default: '#000000',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
