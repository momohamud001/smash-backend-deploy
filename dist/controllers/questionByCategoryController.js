"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const QuestionsByCategory_1 = __importDefault(require("../models/QuestionsByCategory"));
const createQuestionsByCategory = async (req, res) => {
    try {
        const { category, desktop_video_link, mobile_video_link, timestamps, listening_timestamp, questions } = req.body;
        const questionsByCategory = await QuestionsByCategory_1.default.create({ category, desktop_video_link, mobile_video_link, timestamps, listening_timestamp, questions });
        if (!questionsByCategory)
            return res.json({ success: false, message: "Unable to create questions by category" });
        return res.json({ success: true, message: "Questions by category created successfully", questionsByCategory });
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.default = { createQuestionsByCategory };
