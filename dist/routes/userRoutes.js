"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const router = express_1.default.Router();
router.post('/login', userController_1.default.loginUser);
router.post("/transcript", userController_1.default.getUserTranscript);
router.post("/answer/save", (0, express_fileupload_1.default)(), userController_1.default.saveAnswerRecordings);
router.post("/answer/skip", userController_1.default.skipQuestion);
router.post("/answer/skip/all", userController_1.default.skipAllQuestions);
router.post("/answer/save/multiple-choice", userController_1.default.saveMultipleChoiceAnswer);
exports.default = router;
