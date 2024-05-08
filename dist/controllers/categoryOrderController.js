"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CategoryOrder_1 = __importDefault(require("../models/CategoryOrder"));
const mongodb_1 = require("mongodb");
const createCategoryOrder = async (req, res) => {
    try {
        const { order } = req.body;
        let orderData = order.map((id) => {
            return new mongodb_1.ObjectId(id);
        });
        const categoryOrder = await CategoryOrder_1.default.create({ order: orderData });
        if (!categoryOrder)
            return res.json({ success: false, message: "Failed to create category order" });
        return res.json({ success: true, message: "Category order created successfully", categoryOrder });
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: "Internal server error", error: error.message });
    }
};
const appendQuestionCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;
        const categoryOrder = await CategoryOrder_1.default.findById(id);
        if (!categoryOrder) {
            return res.json({ success: false, message: "Failed to find category order" });
        }
        if (categoryOrder.order.includes(category)) {
            return res.json({ success: false, message: "Category already exists in order" });
        }
        const append = await CategoryOrder_1.default.findByIdAndUpdate(id, { $push: { order: category } }, { new: true });
        if (!append)
            return res.json({ success: false, message: "Failed to append category" });
        return res.json({ success: true, message: "Category appended successfully", append });
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.default = { createCategoryOrder, appendQuestionCategory };
