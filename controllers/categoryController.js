const Category = require('../models/categoryModel');

// Create category
const createCategory = async (req, res) => {
    const { categoryName, type } = req.body;
    try {
        const existingCategory = await Category.findOne({
            userId: req.user._id,
            categoryName,
            type
        });

        if (existingCategory) {
            return res.status(202).json({
                success: false,
                message: 'Category already exists'
            });
        }

        const category = await Category.create({
            userId: req.user._id,
            categoryName,
            type
        });

        res.status(201).json({
            success: true,
            data: category,
            message: "Category created successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Category create failed",
            error: error.message
        });
    }
}

// Get All
const getCategory = async (req, res) => {
    try {

        const { search } = req.query;

        const filter = {
            userId: req.user._id,
        }
        if (search) {
            filter.$or = [
                { categoryName: { $regex: search, $options: "i" }},
                { type: { $regex: search, $options: "i" } }
            ]
        }

        const category = await Category.find(filter);

        res.status(200).json({
            success: true,
            data: category,
            message: "Category fetch successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Category fetch failed",
            error: error.message
        });
    }
}

// Get By Id
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Category Not Found'
            });
        }
        res.status(201).json({
            success: true,
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category',
            error: error.message
        });
    }
}

// Update category
const updateCategory = async (req, res) => {
    const { categoryName, type } = req.body;
    try {
        const existingCategory = await Category.findOne({
            userId: req.user._id,
            _id: { $ne: req.params.id },
            categoryName,
            type
        });
        if (existingCategory) {
            return res.status(202).json({
                success: false,
                message: `Category already exists`
            });
        }
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        // Category not found
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
}

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        // Category not found
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
}

module.exports = { createCategory, getCategory, updateCategory, getCategoryById, deleteCategory }