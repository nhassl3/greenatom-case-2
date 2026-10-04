import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { Equipment } from './Equipment'

export class Site extends Model<InferAttributes<Site>, InferCreationAttributes<Site>> {
	declare id: CreationOptional<string>;
	declare name: string;
	declare code: string;
	declare region: string;
	declare lat: number;
	declare lon: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare equipment?: NonAttribute<Equipment[]>;

	static initModel(sequelize: Sequelize) {
		Site.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			name: { type: DataTypes.STRING(120), allowNull: false },
			code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
			region: { type: DataTypes.STRING(120), allowNull: false },
			lat: {
				type: DataTypes.DECIMAL(9, 6),
				allowNull: false,
				validate: { min: -90, max: 90 },
				get() { return Number(this.getDataValue('lat')); },
			},
			lon: {
				type: DataTypes.DECIMAL(9, 6),
				allowNull: false,
				validate: { min: -180, max: 180 },
				get() { return Number(this.getDataValue('lon')); },
			},
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		}, { sequelize, tableName: 'sites', modelName: 'Site' });
	}
}
