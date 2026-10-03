import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { Technician } from './Technician'

export class Specialization extends Model<InferAttributes<Specialization>, InferCreationAttributes<Specialization>> {
	declare id: CreationOptional<string>;
	declare name: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare technicians?: NonAttribute<Technician[]>;

	static initModel(sequelize: Sequelize) {
		Specialization.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		}, { sequelize, tableName: 'specializations', modelName: 'Specialization' });
	}
}
