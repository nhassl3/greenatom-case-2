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
	declare lat: number;
	declare lon: number;
	declare status: CreationOptional<EquipmentStatus>;
	declare installedAt: CreationOptional<Date>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare deletedAt: CreationOptional<Date | null>;

	declare site?: NonAttribute<Site>;
	declare passport?: NonAttribute<EquipmentPassport | null>;
	declare requests?: NonAttribute<MaintenanceRequest[]>;

	static initModel(sequelize: Sequelize) {
		Equipment.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			name: { type: DataTypes.STRING(100), allowNull: false },
			type: { type: DataTypes.ENUM(...EQUIPMENT_TYPES), validate: { isIn: [[...EQUIPMENT_TYPES]] }, allowNull: false },
			siteId: {type: DataTypes.UUID, allowNull: true},
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
			lat: {type: DataTypes.DECIMAL(9, 6), allowNull: false, validate: {min: -90, max: 90}, get() { return Number(this.getDataValue('lat'));}},
			lon: {type: DataTypes.DECIMAL(9, 6), allowNull: false, validate: {min: -180, max: 180}, get() { return Number(this.getDataValue('lon'));}},
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
			deletedAt: { type: DataTypes.DATE, allowNull: true },
		}, {
			sequelize,
			tableName: 'equipment',
			modelName: 'Equipment',
			paranoid: true,
			timestamps: true,
			indexes: [
				{ name: 'equipment_serial_number_active_uq', unique: true, fields: ['serial_number']},
				{ name: 'equipment_site_id_idx', fields: ['site_id'] },
			],
		});
	}
}
