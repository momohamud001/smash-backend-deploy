"use strict";
/// <reference path="../global.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = __importDefault(require("./database/connection"));
const questionsByCategoryRoutes_1 = __importDefault(require("./routes/questionsByCategoryRoutes"));
const createOrderRoutes_1 = __importDefault(require("./routes/createOrderRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
//connect to mongodb
(0, connection_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
//app.use request
app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.method} ${req.originalUrl}`);
    next();
});
app.get('/', (req, res) => {
    res.send("Working Fine!!");
});
// api routes
app.use('/questionsByCategory', questionsByCategoryRoutes_1.default);
app.use('/categoryOrder', createOrderRoutes_1.default);
app.use('/user', userRoutes_1.default);
app.listen(PORT, () => {
    console.log(`App Listening at PORT=${PORT} and BASEURL=http://localhost:${PORT}`);
});
