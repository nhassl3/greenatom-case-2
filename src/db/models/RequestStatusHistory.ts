import { REQUEST_STATUSES } from '@src/common/utils/validators'
import { RequestStatus } from '@src/models/common/general'
import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { MaintenanceRequest } from './MaintenanceRequest'

const forbidChange = () => {
	throw new Error('request_status_history is append-only');
};

export class RequestStatusHistory extends Model<InferAttributes<RequestStatusHistory>, InferCreationAttributes<RequestStatusHistory>> {
	declare id: CreationOptional<string>;
	declare requestId: ForeignKey<MaintenanceRequest['id']>;
	declare oldStatus: RequestStatus | null;
	declare newStatus: RequestStatus;
	declare changedBy: string | null;
	declare comment: string | null;
	declare changedAt: CreationOptional<Date>;

	declare request?: NonAttribute<MaintenanceRequest>;

	static initModel(sequelize: Sequelize) {
		RequestStatusHistory.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },

			oldStatus: { type: DataTypes.ENUM(...REQUEST_STATUSES), validate: { isIn: [[...REQUEST_STATUSES]] }, allowNull: true }, // null при создании новой заявки (но можно по дефолту указать статус 'new')
			newStatus: { type: DataTypes.ENUM(...REQUEST_STATUSES), validate: { isIn: [[...REQUEST_STATUSES]] }, allowNull: false },
			changedBy: { type: DataTypes.STRING(120), allowNull: true },
			comment: { type: DataTypes.TEXT, allowNull: true },
			changedAt: { type: DataTypes.DATE, allowNull: false },
		}, {
			sequelize,
			tableName: 'request_status_history',
			modelName: 'RequestStatusHistory',
			createdAt: false,
			updatedAt: 'changedAt',
			validate: {
				statusChanged(this: RequestStatusHistory) {
					if (this.oldStatus === this.newStatus) throw new Error('oldStatus and newStatus must differ');
				},
			},
			indexes: [{ name: 'request_status_history_request_id_changed_at_idx', fields: ['request_id', 'changed_at'] }],
			hooks: {
				beforeUpdate: forbidChange,
				beforeDestroy: forbidChange,
			},
		});
	}
}
