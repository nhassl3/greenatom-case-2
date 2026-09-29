import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize'
import type { MaintenanceRequest } from './MaintenanceRequest'
import type { RequestAssignee } from './RequestAssignee'
import type { Specialization } from './Specialization'

export class Technician extends Model<InferAttributes<Technician>, InferCreationAttributes<Technician>> {
	declare id: CreationOptional<string>;
	declare fullName: string;
	declare specializationId: ForeignKey<Specialization['id']>;
	declare employeeNumber: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare specialization?: NonAttribute<Specialization>;
	declare requests?: NonAttribute<MaintenanceRequest[]>;
	declare assignments?: NonAttribute<RequestAssignee[]>;
	
	declare RequestAssignee?: NonAttribute<RequestAssignee>;

	static initModel(sequelize: Sequelize) {
		Technician.init({
			id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
			fullName: { type: DataTypes.STRING(150), allowNull: false },
			employeeNumber: { type: DataTypes.STRING(32), allowNull: false, unique: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		}, {
			sequelize,
			tableName: 'technicians',
			modelName: 'Technician',
			indexes: [{ name: 'technicians_specialization_id_idx', fields: ['specialization_id'] }],
		});
	}
}
