import sequelize from '../sequelize'
import { Equipment } from './Equipment'
import { EquipmentPassport } from './EquipmentPassport'
import { MaintenanceRequest } from './MaintenanceRequest'
import { RequestAssignee } from './RequestAssignee'
import { RequestStatusHistory } from './RequestStatusHistory'
import { Site } from './Site'
import { Specialization } from './Specialization'
import { Technician } from './Technician'

Site.initModel(sequelize);
Equipment.initModel(sequelize);
EquipmentPassport.initModel(sequelize);
MaintenanceRequest.initModel(sequelize);
RequestStatusHistory.initModel(sequelize);
Specialization.initModel(sequelize);
Technician.initModel(sequelize);
RequestAssignee.initModel(sequelize);

// Ассоциации. Правила ON DELETE / ON UPDATE совпадают с миграциями.

// Площадка → Оборудование (1:N)
const siteFk = { name: 'siteId', allowNull: false };
Site.hasMany(Equipment, { as: 'equipment', foreignKey: siteFk, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Equipment.belongsTo(Site, { as: 'site', foreignKey: siteFk, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Оборудование → Паспорт (1:1)
const passportFk = { name: 'equipmentId', allowNull: false };
Equipment.hasOne(EquipmentPassport, { as: 'passport', foreignKey: passportFk, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
EquipmentPassport.belongsTo(Equipment, { as: 'equipment', foreignKey: passportFk, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Оборудование → Заявки (1:N)
const requestEquipmentFk = { name: 'equipmentId', allowNull: false };
Equipment.hasMany(MaintenanceRequest, { as: 'requests', foreignKey: requestEquipmentFk, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
MaintenanceRequest.belongsTo(Equipment, { as: 'equipment', foreignKey: requestEquipmentFk, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Заявка → История статусов (1:N), записи не изменяются и не удаляются
const historyFk = { name: 'requestId', allowNull: false };
MaintenanceRequest.hasMany(RequestStatusHistory, { as: 'history', foreignKey: historyFk, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' });
RequestStatusHistory.belongsTo(MaintenanceRequest, { as: 'request', foreignKey: historyFk, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' });

// Специализация → Специалисты (1:N)
const specializationFk = { name: 'specializationId', allowNull: false };
Specialization.hasMany(Technician, { as: 'technicians', foreignKey: specializationFk, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Technician.belongsTo(Specialization, { as: 'specialization', foreignKey: specializationFk, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Заявки ↔ Специалисты (N:M) через request_assignees (role, plannedHours)
MaintenanceRequest.belongsToMany(Technician, {
	through: RequestAssignee,
	as: 'assignees',
	foreignKey: 'requestId',
	otherKey: 'technicianId',
	onDelete: 'CASCADE',
	onUpdate: 'CASCADE',
});
Technician.belongsToMany(MaintenanceRequest, {
	through: RequestAssignee,
	as: 'requests',
	foreignKey: 'technicianId',
	otherKey: 'requestId',
	onDelete: 'RESTRICT',
	onUpdate: 'CASCADE',
});
// прямой доступ к связующей таблице (назначение бригады, отчёты)
MaintenanceRequest.hasMany(RequestAssignee, { as: 'assignments', foreignKey: 'requestId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RequestAssignee.belongsTo(MaintenanceRequest, { as: 'request', foreignKey: 'requestId' });
Technician.hasMany(RequestAssignee, { as: 'assignments', foreignKey: 'technicianId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
RequestAssignee.belongsTo(Technician, { as: 'technician', foreignKey: 'technicianId' });

export {
	sequelize,
	Equipment,
	EquipmentPassport,
	MaintenanceRequest,
	RequestAssignee,
	RequestStatusHistory,
	Site,
	Specialization,
	Technician,
};
