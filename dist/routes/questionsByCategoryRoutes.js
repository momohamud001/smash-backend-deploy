"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionByCategoryController_1 = __importDefault(require("../controllers/questionByCategoryController"));
const router = express_1.default.Router();
router.post('/create', questionByCategoryController_1.default.createQuestionsByCategory);
exports.default = router;
