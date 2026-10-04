import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { Equipment } from './Equipment'

export class EquipmentPassport extends Model<InferAttributes<EquipmentPassport>, InferCreationAttributes<EquipmentPassport>> {
	declare id: CreationOptional<string>;
	declare equipmentId: ForeignKey<Equipment['id']>;
	declare manufacturer: string;
	declare model: string;
	declare nominalPower: number;
	declare lastVerificationDate: string | null; // yyyy-mm-dd
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare equipment?: NonAttribute<Equipment>;

	static initModel(sequelize: Sequelize) {
		EquipmentPassport.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			equipmentId: { type: DataTypes.UUID, allowNull: false, unique: true }, // 1:1 
			manufacturer: { type: DataTypes.STRING(120), allowNull: false },
			model: { type: DataTypes.STRING(120), allowNull: false },
			nominalPower: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				validate: { validate: { isPositive(value: unknown) {
						if (!(Number(value) > 0)) throw new Error('Значение должно быть больше 0');
					},
				}, },
				get() { return Number(this.getDataValue('nominalPower')); },
			},
			lastVerificationDate: { type: DataTypes.DATEONLY, allowNull: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		}, { sequelize, tableName: 'equipment_passports', modelName: 'EquipmentPassport' });
	}
}
