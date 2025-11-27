const Category = require('../models/Category');

// @desc    Get categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    const categories = await Category.find({ user: req.user.id });
    res.status(200).json(categories);
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    if (!req.body.name) {
        res.status(400).json({ message: 'Please add a category name' });
        return;
    }

    const category = await Category.create({
        name: req.body.name,
        color: req.body.color,
        user: req.user.id,
    });

    res.status(200).json(category);
};

module.exports = {
    getCategories,
    createCategory,
};
