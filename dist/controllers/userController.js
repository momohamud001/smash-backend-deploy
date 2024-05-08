"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const UserAnswers_1 = __importDefault(require("../models/UserAnswers"));
const CategoryOrder_1 = __importDefault(require("../models/CategoryOrder"));
const mongodb_1 = require("mongodb");
const UserHistory_1 = __importDefault(require("../models/UserHistory"));
const QuestionsByCategory_1 = __importDefault(require("../models/QuestionsByCategory"));
// Azure Imports
const storage_blob_1 = require("@azure/storage-blob");
const identity_1 = require("@azure/identity");
// Use the below if using default credentials
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const credential = new identity_1.DefaultAzureCredential();
if (!accountName) {
    console.log("Please set the AZURE_STORAGE_ACCOUNT_NAME environment variable.");
}
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
//const client = new SecretClient("https://{keyvaultname}.vault.azure.net/", credential);
//console.log('client', client);
// const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
// const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const loginUser = async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const { name, smash_user_id, bot_preference } = req.body;
        const user = await User_1.default.findOne({ smash_user_id });
        console.log('smash_user_id', smash_user_id);
        console.log('userExist', user);
        if (!user) {
            const newUser = await User_1.default.findOneAndUpdate({ smash_user_id }, {
                name,
                smash_user_id,
                bot_preference,
                last_login: new Date()
            }, { upsert: true, new: true });
            console.log('newUser', newUser);
            if (!newUser) {
                return res.status(400).json({ success: false, message: "Failed to create user" });
            }
            const categoryOrder = await CategoryOrder_1.default.findOne({ _id: new mongodb_1.ObjectId("654d16dc1241d62b6e3e6c09") }); // will make it dynamic later
            const firstCategory = categoryOrder === null || categoryOrder === void 0 ? void 0 : categoryOrder.order[0];
            const questionsByCategory = await QuestionsByCategory_1.default.findOne({ _id: new mongodb_1.ObjectId(firstCategory) });
            const details = [];
            for (let i = 0; i < ((_b = (_a = questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); i++) {
                details.push({
                    question_id: questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions[i].question_id,
                    is_skipped: false,
                    answer_audio_link: null,
                    answer_transcript: null,
                    summary: '',
                    keywords: [],
                    answered_at: null
                });
            }
            const createUserAnswer = await UserAnswers_1.default.findOneAndUpdate({
                smash_user_id, user_id: newUser._id,
                category_id: firstCategory,
            }, {
                smash_user_id,
                user_id: newUser._id,
                category_id: firstCategory,
                attempt_date_time: new Date(),
                details: details
            }, { upsert: true, new: true });
            if (!createUserAnswer) {
                return res.status(400).json({ success: false, message: "Failed to create user answer" });
            }
            const createUserHistory = await UserHistory_1.default.findOneAndUpdate({ smash_user_id }, {
                user_id: newUser._id,
                smash_user_id,
                last_category_accessed: firstCategory,
                login_timestamps: [new Date()],
                all_categories_accessed: [{
                        category_id: firstCategory,
                        accessed_at: new Date(),
                        is_skipped: false,
                        skipped_attempt: 0,
                        skipped_timestamps: []
                    }]
            }, { upsert: true, new: true });
            if (!createUserHistory) {
                return res.status(400).json({ success: false, message: "Failed to create user history" });
            }
            const data = Object.assign(Object.assign({}, questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.toJSON()), { interview_key: createUserAnswer._id });
            return res.status(200).json({ success: true, message: "Login Successful", data: data });
        }
        else {
            const updateLoginTimestamp = await UserHistory_1.default.updateOne({ user_id: new mongodb_1.ObjectId(user._id) }, {
                $push: {
                    login_timestamps: new Date()
                }
            });
            const userHistory = await UserHistory_1.default.findOne({ user_id: new mongodb_1.ObjectId(user._id) });
            const totalAttempts = userHistory === null || userHistory === void 0 ? void 0 : userHistory.login_timestamps.length;
            if (totalAttempts % 3 === 0) {
                // TODO
                let firstCategorySkipped = null;
                for (let i = 0; i < ((_c = userHistory === null || userHistory === void 0 ? void 0 : userHistory.all_categories_accessed.length) !== null && _c !== void 0 ? _c : 0); i++) {
                    if (userHistory === null || userHistory === void 0 ? void 0 : userHistory.all_categories_accessed[i].is_skipped) {
                        firstCategorySkipped = userHistory === null || userHistory === void 0 ? void 0 : userHistory.all_categories_accessed[i];
                        break;
                    }
                }
                if (!firstCategorySkipped) {
                    return res.status(200).json({ success: false, message: "No Category Skipped" });
                }
                const userAnswers = await UserAnswers_1.default.findOne({ user_id: new mongodb_1.ObjectId(user._id), category_id: firstCategorySkipped.category_id });
                const skipped_questions = (userAnswers === null || userAnswers === void 0 ? void 0 : userAnswers.skip_questions_ids) || [];
                const questionsByCategory = await QuestionsByCategory_1.default.findOne({ _id: new mongodb_1.ObjectId(firstCategorySkipped.category_id) });
                const questions = (questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions) || [];
                let questions_timestamps = [];
                let response_timestamps = [];
                let skip_timestamps = [];
                let question_data = [];
                for (let i = 0; i < (questions === null || questions === void 0 ? void 0 : questions.length); i++) {
                    if (skipped_questions.includes(questions[i].question_id)) {
                        question_data.push(questions[i]);
                        questions_timestamps.push(questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions_timestamps[i]);
                        response_timestamps.push(questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.response_timestamps[i]);
                        skip_timestamps.push(questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.skip_timestamps[i]);
                    }
                }
                question_data.push(questions[questions.length - 1]);
                questions_timestamps.push(questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions_timestamps[questions.length - 1]);
                const skipped_intro_videos = (questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.skip_intro_videos) || [];
                const intro_link = skipped_intro_videos[Math.floor(Math.random() * skipped_intro_videos.length)];
                const data = Object.assign(Object.assign({}, questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.toJSON()), { questions_timestamps: questions_timestamps, response_timestamps: response_timestamps, skip_timestamps: skip_timestamps, desktop_intro_video_link: intro_link, questions: question_data, interview_key: userAnswers === null || userAnswers === void 0 ? void 0 : userAnswers._id });
                return res.status(200).json({ success: true, message: "Login Successful", data: data });
            }
            else {
                const lastCategoryAccessed = userHistory === null || userHistory === void 0 ? void 0 : userHistory.last_category_accessed;
                const categoryOrder = await CategoryOrder_1.default.findOne({ _id: new mongodb_1.ObjectId("654d16dc1241d62b6e3e6c09") }); // will make it dynamic later
                const order = categoryOrder === null || categoryOrder === void 0 ? void 0 : categoryOrder.order;
                let nextCategory = "";
                for (let i = 0; i < order.length; i++) {
                    if (order[i].equals(lastCategoryAccessed)) {
                        nextCategory = order[(i + 1) % order.length];
                        break;
                    }
                }
                const isCategoryInHistory = userHistory === null || userHistory === void 0 ? void 0 : userHistory.all_categories_accessed.find((category) => category.category_id.equals(nextCategory));
                if (!isCategoryInHistory) {
                    const updateAllCategoriesAccessed = await UserHistory_1.default.updateOne({ user_id: new mongodb_1.ObjectId(user._id) }, {
                        $push: {
                            all_categories_accessed: {
                                category_id: nextCategory,
                                accessed_at: new Date(),
                                is_skipped: false,
                                skipped_attempt: 0,
                                skipped_timestamps: []
                            }
                        }
                    });
                }
                else {
                    const accessTime = await UserHistory_1.default.updateOne({ user_id: new mongodb_1.ObjectId(user._id), "all_categories_accessed.category_id": nextCategory }, {
                        $set: {
                            "all_categories_accessed.$.accessed_at": new Date()
                        }
                    });
                }
                const updateLastCategoryAccessed = await UserHistory_1.default.updateOne({ user_id: new mongodb_1.ObjectId(user._id) }, {
                    $set: {
                        last_category_accessed: nextCategory
                    },
                });
                const userAnswer = await UserAnswers_1.default.findOne({ user_id: new mongodb_1.ObjectId(user._id), category_id: nextCategory });
                const questionsByCategory = await QuestionsByCategory_1.default.findOne({ _id: new mongodb_1.ObjectId(nextCategory) });
                if (!userAnswer) {
                    const details = [];
                    for (let i = 0; i < ((_e = (_d = questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0); i++) {
                        details.push({
                            question_id: questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions[i].question_id,
                            is_skipped: false,
                            answer_audio_link: null,
                            answer_transcript: null,
                            summary: '',
                            keywords: [],
                            answered_at: null
                        });
                    }
                    const createUserAnswer = await UserAnswers_1.default.findOneAndUpdate({ smash_user_id, user_id: user._id, category_id: nextCategory }, {
                        smash_user_id,
                        user_id: user._id,
                        category_id: nextCategory,
                        attempt_date_time: new Date(),
                        details: details
                    }, { upsert: true, new: true });
                    if (!createUserAnswer) {
                        return res.status(400).json({ success: false, message: "Failed to create user answer" });
                    }
                    const data = Object.assign(Object.assign({}, questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.toJSON()), { interview_key: createUserAnswer === null || createUserAnswer === void 0 ? void 0 : createUserAnswer._id });
                    return res.status(200).json({ success: true, message: "Login Successful", data: data });
                }
                const data = Object.assign(Object.assign({}, questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.toJSON()), { interview_key: userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer._id });
                return res.status(200).json({ success: true, message: "Login Successful", data: data });
            }
        }
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};
const saveAnswerRecordings = async (req, res) => {
    var _a;
    try {
        const { question_id, interview_key } = req.body;
        if (!question_id || !interview_key) {
            return res.json({ success: false, message: "Question ID or Interview Key Missing" });
        }
        console.log(question_id, interview_key);
        const recording = (_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a.recording;
        if (!recording || !recording.mimetype) {
            return res.json({ success: false, message: "Recording Missing" });
        }
        const containerClient = blobServiceClient.getContainerClient("qa-smash-container");
        if (!await containerClient.exists()) {
            const createContainerResponse = await containerClient.create();
            console.log(`Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`);
        }
        const blobType = recording.mimetype.split('/')[1];
        const blobName = `${interview_key}/${question_id}.${blobType}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);
        const uploadBlobResponse = await blockBlobClient.upload(recording.data, recording.data.length, {
            metadata: { question_id, interview_key }
        });
        if (uploadBlobResponse.errorCode) {
            console.log(uploadBlobResponse.errorCode);
            return res.json({ success: false, message: "Error Occurred while saving recording, Try Again." });
        }
        console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`);
        return res.json({ success: true, message: "Recording saved successfully", url: blockBlobClient.url });
    }
    catch (e) {
        console.log(e.message);
        return res.json({ success: false, message: "Internal Server Error Occurred", error: e.message });
    }
};
const skipQuestion = async (req, res) => {
    try {
        const { question_id, interview_key } = req.body;
        const userAnswer = await UserAnswers_1.default.findOne({ _id: new mongodb_1.ObjectId(interview_key) });
        console.log(userAnswer);
        if (!userAnswer) {
            return res.json({ success: false, message: "Invalid Interview Key or question not found" });
        }
        if (!userAnswer.skip_questions_ids.includes(question_id)) {
            const updateSkipQuestion = await UserAnswers_1.default.updateOne({ _id: new mongodb_1.ObjectId(interview_key), "details.question_id": question_id }, {
                $push: {
                    skip_questions_ids: question_id
                },
                $inc: {
                    total_questions_skipped: 1
                },
                $set: {
                    "details.$.is_skipped": true
                }
            });
        }
        const updateHistory = await UserHistory_1.default.updateOne({ user_id: userAnswer.user_id, "all_categories_accessed.category_id": userAnswer.category_id }, {
            $set: {
                "all_categories_accessed.$.is_skipped": true
            }
        });
        return res.json({ success: true, message: "Question Skipped Successfully" });
        // return res.json({ success: false, message: "Question Already Skipped" })
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error Occurred", error: err.message });
    }
};
const skipAllQuestions = async (req, res) => {
    var _a, _b;
    try {
        const { interview_key } = req.body;
        const userAnswer = await UserAnswers_1.default.findOne({ _id: new mongodb_1.ObjectId(interview_key) });
        if (!userAnswer) {
            return res.json({ success: false, message: "Invalid Interview Key or question not found" });
        }
        const skipped = (userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.skip_questions_ids) || [];
        for (let i = 0; i < ((_b = (_a = userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.details) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - 1; i++) {
            if (!(userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.details[i].answer_transcript) && !skipped.includes(userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.details[i].question_id)) {
                skipped.push(userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.details[i].question_id);
                // userAnswer.details[i].is_skipped = true
            }
        }
        for (let id of skipped) {
            userAnswer.details[id].is_skipped = true;
        }
        await UserAnswers_1.default.updateOne({ _id: new mongodb_1.ObjectId(interview_key) }, {
            $set: {
                details: userAnswer.details,
                skip_questions_ids: skipped,
                total_questions_skipped: skipped.length
            }
        });
        const updateHistory = await UserHistory_1.default.updateOne({ user_id: userAnswer.user_id, "all_categories_accessed.category_id": userAnswer.category_id }, {
            $set: {
                "all_categories_accessed.$.is_skipped": true
            }
        });
        return res.json({ success: true, message: "All Questions Skipped Successfully" });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error Occurred", error: err.message });
    }
};
const endInterview = async (req, res) => {
    try {
        // TODO
    }
    catch (err) {
        console.log(err.message);
        return res.json({ success: false, message: "Internal Server Error Occurred", error: err.message });
    }
};
const saveMultipleChoiceAnswer = async (req, res) => {
    try {
        const { question_id, interview_key, answer } = req.body;
        const answerObj = {
            question_id: question_id,
            is_skipped: false,
            answer_audio_link: null,
            answer_transcript: answer,
            summary: '',
            keywords: [],
            answered_at: new Date()
        };
        const userAnswer = await UserAnswers_1.default.findOne({ _id: new mongodb_1.ObjectId(interview_key), "details.question_id": question_id });
        if (userAnswer) {
            const updateAnswer = await UserAnswers_1.default.updateOne({ _id: new mongodb_1.ObjectId(interview_key), "details.question_id": question_id }, {
                $set: {
                    "details.$.answer_transcript": answer,
                    "details.$.answered_at": new Date(),
                },
                $pull: {
                    skip_questions_ids: question_id
                }
            });
            if (updateAnswer.modifiedCount === 0) {
                return res.json({ success: false, message: "Error Saving Answer" });
            }
        }
        else {
            const updateAnswer = await UserAnswers_1.default.updateOne({ _id: new mongodb_1.ObjectId(interview_key) }, {
                $push: {
                    details: answerObj
                },
                $inc: {
                    total_questions_answered: 1
                },
                $pull: {
                    skip_questions_ids: question_id
                }
            });
            if (updateAnswer.modifiedCount === 0) {
                return res.json({ success: false, message: "Error Saving Answer" });
            }
        }
        return res.json({ success: true, message: "Answer Saved Successfully" });
    }
    catch (err) {
        console.log(err.message);
        return res.json({ success: false, message: "Internal Server Error Occurred", error: err.message });
    }
};
const getUserTranscript = async (req, res) => {
    try {
        const { smash_user_id, interview_key } = req.body;
        const userAnswer = await UserAnswers_1.default.findOne({ smash_user_id, _id: new mongodb_1.ObjectId(interview_key) });
        if (!userAnswer) {
            return res.json({ success: false, message: "Invalid Interview Key" });
        }
        const category_id = userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.category_id;
        const questionsByCategory = await QuestionsByCategory_1.default.findOne({ _id: category_id });
        const questions = (questionsByCategory === null || questionsByCategory === void 0 ? void 0 : questionsByCategory.questions) || [];
        const data = [];
        for (let i = 0; i < questions.length - 1; i++) {
            const question = questions[i];
            const answer = userAnswer === null || userAnswer === void 0 ? void 0 : userAnswer.details.find((answer) => answer.question_id === question.question_id);
            if (answer) {
                data.push({
                    question_id: question.question_id,
                    question: question.question_text,
                    answer: answer.answer_transcript,
                    summary: answer.summary,
                    keywords: answer.keywords.join(", "),
                    skipped: answer.is_skipped
                });
            }
        }
        return res.json({ success: true, message: "Transcript Fetched Successfully", data: data });
    }
    catch (err) {
        console.log(err.message);
        return res.json({ success: false, message: "Internal Server Error Occurred", error: err.message });
    }
};
exports.default = { loginUser, saveAnswerRecordings, skipQuestion, saveMultipleChoiceAnswer, skipAllQuestions, getUserTranscript };
