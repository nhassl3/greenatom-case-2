"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const MockOrm_1 = __importDefault(require("./MockOrm"));
async function getOne(id) {
    const db = await MockOrm_1.default.openDb();
    return db.equipments.find(equipment => equipment.id === id) ?? null;
}
async function persists(id) {
    const db = await MockOrm_1.default.openDb();
    const equipmentIds = new Set(db.equipments.map(equipment => equipment.id));
    return equipmentIds.has(id);
}
async function getAll() {
    const db = await MockOrm_1.default.openDb();
    return db.equipments;
}
async function add(equipment) {
    const db = await MockOrm_1.default.openDb();
    equipment.id = (0, uuid_1.v4)().toString();
    equipment.installedAt = new Date().toISOString();
    db.equipments.push(equipment);
    return MockOrm_1.default.saveDb(db);
}
async function updateOne(id, equipment) {
    const db = await MockOrm_1.default.openDb();
    for (let i = 0; i < db.equipments.length; i++) {
        if (db.equipments[i].id === equipment.id) {
            const dbEquipment = db.equipments[i];
            db.equipments[i] = {
                ...dbEquipment,
                name: equipment.name,
            };
        }
    }
}
async function delete_(id) {
    const db = await MockOrm_1.default.openDb();
    for (let i = 0; i < db.equipments.length; i++) {
        if (db.equipments[i].id === id) {
            db.equipments.splice(i, 1);
            return MockOrm_1.default.saveDb(db);
        }
    }
}
async function deleteAllEquipments() {
    const db = await MockOrm_1.default.openDb();
    db.equipments = [];
    return MockOrm_1.default.saveDb(db);
}
async function insertMultiple(equipments) {
    const db = await MockOrm_1.default.openDb(), equipmentF = [...equipments];
    for (const equipment of equipmentF) {
        equipment.id = (0, uuid_1.v4)().toString();
        equipment.installedAt = new Date();
    }
    db.equipments = [...db.equipments, ...equipments];
    await MockOrm_1.default.saveDb(db);
    return equipmentF;
}
exports.default = {
    getOne,
    getAll,
    persists,
    add,
    updateOne,
    delete: delete_,
    deleteAllEquipments,
    insertMultiple,
};
