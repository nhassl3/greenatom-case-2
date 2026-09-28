import { IEquipment } from '@src/models/Equipment.model';
import { IMaintenanceRequest } from '@src/models/Maintenance.model';
import EquipmentRepo from '@src/repos/EquipmentRepo';
import RequestRepo from '@src/repos/MaintenanceRequestRepo';

/******************************************************************************
                                Constants
******************************************************************************/

export const IDS = {
  turbine: 'aaaaaaaa-1111-4111-8111-111111111111',
  inverter: 'bbbbbbbb-2222-4222-8222-222222222222',
  sensor: 'cccccccc-3333-4333-8333-333333333333',
  reqNew: 'dddddddd-4444-4444-8444-444444444444',
  reqInProgress: 'eeeeeeee-5555-4555-8555-555555555555',
  reqDone: 'ffffffff-6666-4666-8666-666666666666',
  missing: '00000000-0000-4000-8000-000000000000',
} as const;

const EQUIPMENT: readonly IEquipment[] = [
  {
    id: IDS.turbine, name: 'Test Turbine X1', type: 'turbine', serialNumber: 'TEST-TRB-X1',
    location: { lat: 10, lon: 20 }, status: 'operational', installedAt: '2023-06-01T00:00:00.000Z',
  },
  {
    id: IDS.inverter, name: 'Test Inverter X2', type: 'inverter', serialNumber: 'TEST-INV-X2',
    location: { lat: 11, lon: 21 }, status: 'fault', installedAt: '2023-08-15T00:00:00.000Z',
  },
  {
    id: IDS.sensor, name: 'Test Sensor X3', type: 'sensor', serialNumber: 'TEST-SNS-X3',
    location: { lat: 12, lon: 22 }, status: 'maintenance', installedAt: '2024-01-10T00:00:00.000Z',
  },
];

const REQUESTS: readonly IMaintenanceRequest[] = [
  {
    id: IDS.reqNew, equipmentId: IDS.turbine, title: 'Test maintenance new', priority: 'low',
    status: 'new', plannedAt: '2026-04-01T00:00:00.000Z',
    createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: IDS.reqInProgress, equipmentId: IDS.inverter, title: 'Test maintenance in progress', priority: 'high',
    status: 'in_progress', plannedAt: '2026-03-10T00:00:00.000Z',
    createdAt: '2026-03-05T00:00:00.000Z', updatedAt: '2026-03-06T00:00:00.000Z',
  },
  {
    id: IDS.reqDone, equipmentId: IDS.sensor, title: 'Test maintenance done', priority: 'critical',
    status: 'done', plannedAt: '2026-01-15T00:00:00.000Z',
    createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-16T00:00:00.000Z',
  },
];

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Приводит тестовую базу к известному состоянию. Копии, чтобы тесты не меняли константы.
 */
export async function seed(): Promise<void> {
  await EquipmentRepo.deleteAllEquipments();
  await RequestRepo.deleteAllRequests();
  await EquipmentRepo.insertMultiple(structuredClone(EQUIPMENT));
  await RequestRepo.insertMultiple(structuredClone(REQUESTS));
}
