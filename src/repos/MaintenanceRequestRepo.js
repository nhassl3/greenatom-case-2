"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const MockOrm_1 = __importDefault(require("./MockOrm"));
async function getOne(id) {
    return (await MockOrm_1.default.openDb()).maintenances.find(request => request.id === id) ?? null;
}
async function persists(id) {
    return new Set((await MockOrm_1.default.openDb()).maintenances.map(request => request.id)).has(id);
}
async function getAll() {
    return (await MockOrm_1.default.openDb()).maintenances;
}
async function add(request) {
    const db = await MockOrm_1.default.openDb();
    request.id = (0, uuid_1.v4)().toString();
    request.createdAt = new Date().toISOString();
    request.updatedAt = new Date().toISOString();
    db.maintenances.push(request);
    return MockOrm_1.default.saveDb(db);
}
async function update(id, request) {
    const db = await MockOrm_1.default.openDb();
    for (let i = 0; i < db.maintenances.length; i++) {
        if (db.maintenances[i].id === id) {
            const dbRequest = db.maintenances[i];
            db.maintenances[i] = {
                ...dbRequest,
                ...request,
                id: dbRequest.id,
                equipmentId: dbRequest.equipmentId,
                status: dbRequest.status,
                createdAt: dbRequest.createdAt,
                updatedAt: new Date().toISOString(),
            };
            return MockOrm_1.default.saveDb(db);
        }
    }
}
async function updateStatus(id, status) {
    const db = await MockOrm_1.default.openDb();
    for (let i = 0; i < db.maintenances.length; i++) {
        if (db.maintenances[i].id === id) {
            const dbRequest = db.maintenances[i];
            db.maintenances[i] = {
                ...dbRequest,
                status: status,
                updatedAt: new Date().toISOString(),
            };
            return MockOrm_1.default.saveDb(db);
        }
    }
}
async function delete_(id) {
    const db = await MockOrm_1.default.openDb();
    for (let i = 0; i < db.maintenances.length; i++) {
        if (db.maintenances[i].id === id) {
            db.maintenances.splice(i, 1);
            return MockOrm_1.default.saveDb(db);
        }
    }
}
async function getAllRequestsByEqipmentId(eqipment_id) {
    return (await MockOrm_1.default.openDb()).maintenances.filter(request => request.equipmentId === eqipment_id);
}
exports.default = {
    getOne,
    getAll,
    persists,
    add,
    update,
    updateStatus,
    delete: delete_,
    getAllRequestsByEqipmentId
};
