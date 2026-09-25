"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCodes_1 = __importDefault(require("@src/common/constants/HttpStatusCodes"));
const Equipment_model_1 = __importDefault(require("@src/models/Equipment.model"));
const EquipmentService_1 = __importDefault(require("@src/services/EquipmentService"));
const jet_validators_1 = require("jet-validators");
const utils_1 = require("jet-validators/utils");
const parseReq_1 = __importDefault(require("./common/parseReq"));
const reqValidators = {
    getOne: (0, parseReq_1.default)({ id: (0, utils_1.transform)(String, jet_validators_1.isString) }),
    add: (0, parseReq_1.default)({ equipment: Equipment_model_1.default.isNew }),
    patch: (0, parseReq_1.default)({ equipment: Equipment_model_1.default.isPartial }),
    delete: (0, parseReq_1.default)({ id: (0, utils_1.transform)(String, jet_validators_1.isString) }),
};
async function get(_, res) {
    const equipements = await EquipmentService_1.default.getAll();
    res.status(HttpStatusCodes_1.default.OK).json({ equipements });
}
async function add(req, res) {
    const { equipment } = reqValidators.add(req.body);
    await EquipmentService_1.default.addOne(Equipment_model_1.default.new(equipment));
    res.status(HttpStatusCodes_1.default.CREATED).end();
}
async function getById(req, res) {
    const { id } = reqValidators.getOne(req.params);
    const equipment = await EquipmentService_1.default.getOne(id);
    res.status(HttpStatusCodes_1.default.OK).json({ equipment });
}
async function patch(req, res) {
    const { id } = reqValidators.getOne(req.params);
    const { equipment } = reqValidators.patch(req.body);
    await EquipmentService_1.default.updateOne(id, equipment);
    res.status(HttpStatusCodes_1.default.OK).end();
}
async function delete_(req, res) {
    const { id } = reqValidators.delete(req.params);
    await EquipmentService_1.default.deleteOne(id);
    res.status(HttpStatusCodes_1.default.OK).end();
}
async function getRequest(req, res) {
    const { id } = reqValidators.getOne(req.params);
    const equipmentRequests = await EquipmentService_1.default.getEquipmentRequests(id);
    res.status(HttpStatusCodes_1.default.OK).json({ equipmentRequests });
}
async function getWeather(req, res) {
    const { id } = reqValidators.getOne(req.params);
    const equipmentWeather = await EquipmentService_1.default.getEquipmentWeather(id);
    res.status(HttpStatusCodes_1.default.OK).json({ equipmentWeather });
}
exports.default = {
    get,
    add,
    getById,
    patch,
    delete: delete_,
    getRequest,
    getWeather
};
