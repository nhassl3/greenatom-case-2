"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const Paths_1 = __importDefault(require("@src/common/constants/Paths"));
const route_errors_1 = require("@src/common/utils/route-errors");
const apiRouter_1 = __importDefault(require("@src/routes/apiRouter"));
const env_1 = __importStar(require("./common/constants/env"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (env_1.default.NodeEnv === env_1.NodeEnvs.DEV) {
    app.use((0, morgan_1.default)('dev'));
}
if (env_1.default.NodeEnv === env_1.NodeEnvs.PRODUCTION) {
    app.use((0, helmet_1.default)());
}
app.use(Paths_1.default._, apiRouter_1.default);
app.use((err, _, res, next) => {
    if (env_1.default.NodeEnv !== env_1.NodeEnvs.TEST.valueOf()) {
        jet_logger_1.default.err(err, true);
    }
    if (err instanceof route_errors_1.RouteError) {
        res.status(err.status).json(err.toResponseBody());
        return;
    }
    return next(err);
});
const viewsDir = path_1.default.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path_1.default.join(__dirname, 'public');
app.use(express_1.default.static(staticDir));
app.get('/', (_, res) => {
    return res.redirect('/api/health');
});
app.get('/users', (_, res) => {
    return res.sendFile('users.html', { root: viewsDir });
});
exports.default = app;
