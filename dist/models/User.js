"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    smash_user_id: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    bot_preference: {
        type: String,
        required: true
    },
    last_login: {
        type: Date,
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('User', UserSchema);
