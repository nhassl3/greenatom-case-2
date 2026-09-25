import { isEquipmentStatus, isEquipmentType, isValidUUID, transformIsDateNotInFuture } from '@src/common/utils/validators'
import { isInteger, isNonEmptyString, isString } from 'jet-validators'
import { makeOptional, parseObject, Schema, testObject } from 'jet-validators/utils'
import { v4 } from 'uuid'

const GetDefaults = (): IEquipment => ({
	id: v4(),
	name: "Name",
	type: "sensor",
	serialNumber: "A1",
	location: {
		lat: 0,
		lon: 0,
	},
	status: "operational",
	installedAt: new Date(),
});

const schema: Schema<IEquipment> = {
	id: isValidUUID,
	name: isString,
	type: isEquipmentType,
	serialNumber: isString,
	location: {
		lat: isInteger,
		lon: isInteger,
	},
	status: isEquipmentStatus,
	installedAt: transformIsDateNotInFuture,
}

// Types

/** 
 * @entity equipment
*/
export interface IEquipment {
	id: string; // @PK UUID
	name: string; // @REQUIRED
	type: string; // @CHECK IN ('turbine', 'inverter', 'sensor', 'substation')
	serialNumber: string; // @UNIQUE
	location: {
		lat: number;
		lon: number;
	};
	status: string; // @CHECK IN ('operational', 'maintenance', 'fault', 'decommissioned')
	installedAt: Date | string; // ISO Date-time, not in future
};

export type IEquipmentPatch = Partial<Omit<IEquipment, 'id' | 'location'>> & {
	location?: Partial<IEquipment['location']>;
};

const parseEquipment = parseObject<IEquipment>(schema);

const isNewEquipment = testObject<Omit<IEquipment, 'id' | 'installedAt'>>({
	name: isNonEmptyString,
	type: isEquipmentType,
	serialNumber: isString,
	location: {
		lat: isInteger,
		lon: isInteger,
	},
	status: isEquipmentStatus,
})

const isPartialEquipment = testObject<IEquipmentPatch>({
	name: makeOptional(isNonEmptyString),
	type: makeOptional(isEquipmentType),
	serialNumber: makeOptional(isString),
	location: makeOptional(testObject({
		lat: makeOptional(isInteger),
		lon: makeOptional(isInteger),
	})),
	status: makeOptional(isEquipmentStatus),
	installedAt: makeOptional(transformIsDateNotInFuture),
})

// New Object

function new_(equipment?: Partial<IEquipment>): IEquipment {
	return parseEquipment({ ...GetDefaults(), ...equipment}, (errors) => {
		throw new Error("Setup new user failed " + JSON.stringify(errors, null, 2));
	});
}

export default {
	new: new_,
	isNew: isNewEquipment,
	isPartial: isPartialEquipment,
} as const;
