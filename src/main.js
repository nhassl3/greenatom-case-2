"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jet_logger_1 = __importDefault(require("jet-logger"));
const env_1 = __importDefault(require("./common/constants/env"));
const server_1 = __importDefault(require("./server"));
const SERVER_START_MESSAGE = 'Express server started on port: ' + env_1.default.Port.toString();
server_1.default.listen(env_1.default.Port, (err) => {
    if (!!err) {
        jet_logger_1.default.err(err.message);
    }
    else {
        jet_logger_1.default.info(SERVER_START_MESSAGE);
    }
});
