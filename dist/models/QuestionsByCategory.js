"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const QuestionsByCategorySchema = new Schema({
    category: {
        type: String,
        required: true
    },
    desktop_video_link: {
        type: String,
        default: ""
    },
    mobile_video_link: {
        type: String,
        default: ""
    },
    desktop_intro_video_link: {
        type: String,
        default: ""
    },
    mobile_intro_video_link: {
        type: String,
        default: ""
    },
    timestamps: {
        type: [],
        default: []
    },
    listening_timestamps: {
        type: Object,
        default: { start_time: 0, end_time: 0 }
    },
    questions: {
        type: [],
        default: []
    },
    questions_timestamps: {
        type: [],
        default: []
    },
    response_timestamps: {
        type: [],
        default: []
    },
    skip_timestamps: {
        type: [],
        default: []
    },
    skip_intro_videos: {
        type: [],
        default: []
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('QuestionsByCategory', QuestionsByCategorySchema);
