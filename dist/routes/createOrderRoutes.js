"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryOrderController_1 = __importDefault(require("../controllers/categoryOrderController"));
const router = express_1.default.Router();
router.post('/create', categoryOrderController_1.default.createCategoryOrder);
router.put('/append/:id', categoryOrderController_1.default.appendQuestionCategory);
exports.default = router;
