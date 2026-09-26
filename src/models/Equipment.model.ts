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