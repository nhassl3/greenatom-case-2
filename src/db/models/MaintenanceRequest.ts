import { REQUEST_PRIORITIES, REQUEST_STATUSES } from '@src/common/utils/validators'
import { RequestPriority, RequestStatus } from '@src/models/common/general'
import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { Equipment } from './Equipment'
import type { RequestAssignee } from './RequestAssignee'
import type { RequestStatusHistory } from './RequestStatusHistory'
import type { Technician } from './Technician'

export class MaintenanceRequest extends Model<InferAttributes<MaintenanceRequest>, InferCreationAttributes<MaintenanceRequest>> {
	declare id: CreationOptional<string>;
	declare equipmentId: ForeignKey<Equipment['id']>;
	declare title: string;
	declare description: string | null;
	declare priority: RequestPriority;
	declare status: CreationOptional<RequestStatus>;
	declare plannedAt: Date | null;
	declare author: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare deletedAt: CreationOptional<Date | null>;

	declare equipment?: NonAttribute<Equipment>;
	declare history?: NonAttribute<RequestStatusHistory[]>;
	declare assignees?: NonAttribute<Technician[]>;
	declare assignments?: NonAttribute<RequestAssignee[]>;

	static initModel(sequelize: Sequelize) {
		MaintenanceRequest.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			title: { type: DataTypes.STRING(120), allowNull: false },
			description: { type: DataTypes.TEXT, allowNull: true, validate: { len: [0, 2000] } },
			priority: { type: DataTypes.ENUM(...REQUEST_PRIORITIES), validate: { isIn: [[...REQUEST_PRIORITIES]] }, allowNull: false },
			status: { type: DataTypes.ENUM(...REQUEST_STATUSES), validate: { isIn: [[...REQUEST_STATUSES]] }, allowNull: false, defaultValue: 'new' },
			plannedAt: { type: DataTypes.DATE, allowNull: true },
			author: { type: DataTypes.STRING(120), allowNull: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
			deletedAt: DataTypes.DATE,
		}, {
			sequelize,
			tableName: 'maintenance_requests',
			modelName: 'MaintenanceRequest',
			indexes: [
				{ name: 'maintenance_requests_equipment_id_idx', fields: ['equipment_id'] },
				{ name: 'maintenance_requests_status_idx', fields: ['status'] },
			],
		});
	}
}
