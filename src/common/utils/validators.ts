import { isDate, isNonEmptyString } from 'jet-validators'
import { transform } from 'jet-validators/utils'
import { validate as uuidValidate } from 'uuid'

// Constants

const equipmentTypes = ['turbine', 'inverter', 'sensor', 'substation'] as const;

const equipmentStatuses = ['operational', 'maintenance', 'fault', 'decommissioned'] as const;

const maintenanceStatuses = ['new', 'in_progress', 'done', 'rejected'] as const;

const maintenancePriority = ['low', 'medium', 'high', 'critical'] as const;

type EquipmentType = typeof equipmentTypes[number];

type EquipmentStatus = typeof equipmentStatuses[number];

type MaintenanceStatus = typeof maintenanceStatuses[number];

type MaintenancePriority = typeof maintenancePriority[number];

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Convert to date object then check is a validate date.
 */
export const transformIsDate = transform(
  (arg) => new Date(arg as string),
  (arg) => isDate(arg),
);

export function isEquipmentType(value: unknown): value is EquipmentType {
  return equipmentTypes.includes(value as EquipmentType);
}

export function isEquipmentStatus(value: unknown): value is EquipmentStatus {
  return equipmentStatuses.includes(value as EquipmentStatus);
}

export const transformIsDateNotInFuture = transform(
  (arg) => new Date(arg as string),
  (arg): arg is Date => isDate(arg) && arg <= new Date(),
);

export function isMaintenanceStatus(value: unknown): value is MaintenanceStatus {
  return maintenanceStatuses.includes(value as MaintenanceStatus);
}

export function isMaintenancePriority(value: unknown): value is MaintenancePriority {
  return maintenancePriority.includes(value as MaintenancePriority);
}

export const isValidUUID = transform(
  (arg) => arg as string,
  (arg): arg is string => isNonEmptyString(arg) && uuidValidate(arg),
);