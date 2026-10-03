import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES } from '@src/common/utils/validators'
import { EquipmentStatus, EquipmentType } from '@src/models/common/general'
import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { EquipmentPassport } from './EquipmentPassport'
import type { MaintenanceRequest } from './MaintenanceRequest'
import type { Site } from './Site'

export class Equipment extends Model<InferAttributes<Equipment>, InferCreationAttributes<Equipment>> {
	declare id: CreationOptional<string>;
	declare siteId: ForeignKey<Site['id']>;
	declare name: string;
	declare type: EquipmentType;
	declare serialNumber: string;
	declare status: CreationOptional<EquipmentStatus>;
	declare installedAt: CreationOptional<Date>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare site?: NonAttribute<Site>;
	declare passport?: NonAttribute<EquipmentPassport | null>;
	declare requests?: NonAttribute<MaintenanceRequest[]>;

	static initModel(sequelize: Sequelize) {
		Equipment.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			name: { type: DataTypes.STRING(100), allowNull: false },
			type: { type: DataTypes.ENUM(...EQUIPMENT_TYPES), validate: { isIn: [[...EQUIPMENT_TYPES]] }, allowNull: false },
			serialNumber: { type: DataTypes.STRING(64), allowNull: false },
			status: { type: DataTypes.ENUM(...EQUIPMENT_STATUSES), validate: { isIn: [[...EQUIPMENT_STATUSES]] }, allowNull: false, defaultValue: 'operational' },
			installedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
				validate: {
					notInFuture(value: Date) {
						if (new Date(value) > new Date()) throw new Error('installedAt cannot be in the future');
					},
				},
			},
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		}, {
			sequelize,
			tableName: 'equipment',
			modelName: 'Equipment',
			indexes: [
				{ name: 'equipment_serial_number_active_uq', unique: true, fields: ['serial_number'], where: { deleted_at: null } },
				{ name: 'equipment_site_id_idx', fields: ['site_id'] },
			],
		});
	}
}
