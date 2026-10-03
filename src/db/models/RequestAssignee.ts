import { ASSIGNEE_ROLES } from '@src/common/utils/validators'
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { MaintenanceRequest } from './MaintenanceRequest'
import type { Technician } from './Technician'

export type AssigneeRole = (typeof ASSIGNEE_ROLES)[number];

// Связующая модель N:M заявка ↔ специалист. PK составной (requestId, technicianId), собственного id нет.
export class RequestAssignee extends Model<InferAttributes<RequestAssignee>, InferCreationAttributes<RequestAssignee>> {
	declare requestId: MaintenanceRequest['id'];
	declare technicianId: Technician['id'];
	declare role: CreationOptional<AssigneeRole>;
	declare plannedHours: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare request?: NonAttribute<MaintenanceRequest>;
	declare technician?: NonAttribute<Technician>;

	static initModel(sequelize: Sequelize) {
		RequestAssignee.init({
			requestId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
			technicianId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
			role: { type: DataTypes.ENUM(...ASSIGNEE_ROLES), validate: { isIn: [[...ASSIGNEE_ROLES]] }, allowNull: false, defaultValue: 'member' },
			plannedHours: {
				type: DataTypes.DECIMAL(5, 2),
				allowNull: false,
				validate: { gt: 0},
				get() { return Number(this.getDataValue('plannedHours')); },
			},
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		}, {
			sequelize,
			tableName: 'request_assignees',
			modelName: 'RequestAssignee',
			indexes: [
				{ name: 'request_assignees_one_lead_uq', unique: true, fields: ['request_id'], where: { role: 'lead' } }, // не более одного ведущего на заявку
				{ name: 'request_assignees_technician_id_idx', fields: ['technician_id'] },
			],
		});
	}
}
