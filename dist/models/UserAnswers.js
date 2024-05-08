"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const UserAnswersSchema = new Schema({
    smash_user_id: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    attempt_number: {
        type: Number,
        default: 1
    },
    attempt_date_time: {
        type: Date,
    },
    category_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: [],
        default: []
    },
    all_skipped: {
        type: Boolean,
        default: false
    },
    total_questions_answered: {
        type: Number,
        default: 0
    },
    total_questions_skipped: {
        type: Number,
        default: 0
    },
    skip_questions_ids: {
        type: [],
        default: []
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("UserAnswers", UserAnswersSchema);
