"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/example";
const connectToMongoDB = () => {
    try {
        mongoose_1.default.connect(MONGO_URI);
        console.log("Connected to Mongoose.");
    }
    catch (err) {
        console.log("Could not connect: " + err);
    }
    const dbConnection = mongoose_1.default.connection;
    dbConnection.on("error", (err) => {
        console.log(`Connection Error: ${err}`);
    });
    dbConnection.once("open", () => {
        console.log("Connected to DB!");
    });
};
exports.default = connectToMongoDB;
