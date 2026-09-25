"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JetPaths = void 0;
const jet_paths_1 = __importDefault(require("jet-paths"));
const Paths = {
    _: '/api',
    Health: {
        _: "/health",
    },
    Users: {
        _: '/users',
        Get: '/all',
        Add: '/add',
        Update: '/update',
        Delete: '/delete/:id',
    },
    Equipment: {
        _: "/equipment",
        Get: "",
        Add: "",
        GetId: "/:id",
        Patch: "/:id",
        Delete: "/:id",
        GetRequests: "/:id/requests",
        GetWeather: "/:id/weather",
    },
    Requests: {
        _: "/requests",
        Get: "",
        Add: "",
        GetId: "/:id",
        Patch: "/:id",
        PatchStatus: "/:id/status",
        Delete: "/:id"
    }
};
exports.JetPaths = (0, jet_paths_1.default)(Paths);
exports.default = Paths;
