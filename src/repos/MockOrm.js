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
const jsonfile_1 = __importDefault(require("jsonfile"));
const tspo_1 = __importDefault(require("tspo"));
const env_1 = __importStar(require("@src/common/constants/env"));
const DATABASE_FILE_PATH = __dirname +
    '/common' +
    (env_1.default.NodeEnv === env_1.NodeEnvs.TEST
        ? '/database.test.json'
        : '/database.json');
async function openDb() {
    const db = await jsonfile_1.default.readFile(DATABASE_FILE_PATH);
    if (!('users' in db) || !('maintenances' in db) || !('equipments' in db)) {
        return tspo_1.default.addEntries(db, [
            ['users', []],
            ['equipments', []],
            ['maintenances', []],
        ]);
    }
    return db;
}
function saveDb(db) {
    return jsonfile_1.default.writeFile(DATABASE_FILE_PATH, db);
}
function cleanDb() {
    return jsonfile_1.default.writeFile(DATABASE_FILE_PATH, {});
}
exports.default = {
    openDb,
    saveDb,
    cleanDb,
};
