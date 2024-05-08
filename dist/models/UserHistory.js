"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const UserHistorySchema = new Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    smash_user_id: {
        type: String,
        required: true,
    },
    last_category_accessed: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    all_categories_accessed: {
        type: [],
        default: []
    },
    login_timestamps: {
        type: [],
        default: []
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('UserHistory', UserHistorySchema);
