import { Equipment, MaintenanceRequest, RequestAssignee, RequestStatusHistory, sequelize, Site, Specialization, Technician } from '@src/db/models'

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
  site: '11111111-aaaa-4aaa-8aaa-111111111111',
  spec: '22222222-aaaa-4aaa-8aaa-222222222222',
  techLead: '33333333-aaaa-4aaa-8aaa-333333333333',
  techMember: '44444444-aaaa-4aaa-8aaa-444444444444',
  techFree: '55555555-aaaa-4aaa-8aaa-555555555555',
  missing: '00000000-0000-4000-8000-000000000000',
} as const;

const d = (s: string) => new Date(s);

const TABLES = [
  'request_status_history', 'request_assignees', 'maintenance_requests', 'equipment_passports',
  'equipment', 'technicians', 'specializations', 'sites',
];

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Приводит тестовую БД к известному состоянию: TRUNCATE всех таблиц (триггер журнала TRUNCATE не перехватывает) и фикстуры.
 */
export async function seed(): Promise<void> {
  await sequelize.query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);

  await Site.create({ id: IDS.site, name: 'Test site', code: 'TST-01', region: 'Test', lat: 10, lon: 20 });
  await Specialization.create({ id: IDS.spec, name: 'Electrician' });
  await Technician.bulkCreate([
    { id: IDS.techLead, fullName: 'Lead Tech', specializationId: IDS.spec, employeeNumber: 'T-1' },
    { id: IDS.techMember, fullName: 'Member Tech', specializationId: IDS.spec, employeeNumber: 'T-2' },
    { id: IDS.techFree, fullName: 'Free Tech', specializationId: IDS.spec, employeeNumber: 'T-3' },
  ]);

  await Equipment.bulkCreate([
    {
      id: IDS.turbine, siteId: IDS.site, name: 'Test Turbine X1', type: 'turbine', serialNumber: 'TEST-TRB-X1',
      lat: 10, lon: 20, status: 'operational', installedAt: d('2023-06-01T00:00:00.000Z'),
    },
    {
      id: IDS.inverter, siteId: null, name: 'Test Inverter X2', type: 'inverter', serialNumber: 'TEST-INV-X2',
      lat: 11, lon: 21, status: 'fault', installedAt: d('2023-08-15T00:00:00.000Z'),
    },
    {
      id: IDS.sensor, siteId: null, name: 'Test Sensor X3', type: 'sensor', serialNumber: 'TEST-SNS-X3',
      lat: 12, lon: 22, status: 'maintenance', installedAt: d('2024-01-10T00:00:00.000Z'),
    },
  ]);

  await MaintenanceRequest.bulkCreate([
    {
      id: IDS.reqNew, equipmentId: IDS.turbine, title: 'Test maintenance new', priority: 'low', status: 'new',
      description: null, author: null, plannedAt: d('2026-04-01T00:00:00.000Z'),
      createdAt: d('2026-03-01T00:00:00.000Z'), updatedAt: d('2026-03-01T00:00:00.000Z'),
    },
    {
      id: IDS.reqInProgress, equipmentId: IDS.inverter, title: 'Test maintenance in progress', priority: 'high', status: 'in_progress',
      description: null, author: null, plannedAt: d('2026-03-10T00:00:00.000Z'),
      createdAt: d('2026-03-05T00:00:00.000Z'), updatedAt: d('2026-03-06T00:00:00.000Z'),
    },
    {
      id: IDS.reqDone, equipmentId: IDS.sensor, title: 'Test maintenance done', priority: 'critical', status: 'done',
      description: null, author: null, plannedAt: d('2026-01-15T00:00:00.000Z'),
      createdAt: d('2026-01-10T00:00:00.000Z'), updatedAt: d('2026-01-16T00:00:00.000Z'),
    },
  ]);

  // бригады у заявок в работе и выполненных (ровно один lead)
  await RequestAssignee.bulkCreate([
    { requestId: IDS.reqInProgress, technicianId: IDS.techLead, role: 'lead', plannedHours: 4 },
    { requestId: IDS.reqInProgress, technicianId: IDS.techMember, role: 'member', plannedHours: 2 },
    { requestId: IDS.reqDone, technicianId: IDS.techLead, role: 'lead', plannedHours: 3 },
  ]);

  // журнал, согласованный со статусами
  await RequestStatusHistory.bulkCreate([
    { requestId: IDS.reqNew, oldStatus: null, newStatus: 'new', changedBy: null, comment: null, changedAt: d('2026-03-01T00:00:00.000Z') },
    { requestId: IDS.reqInProgress, oldStatus: null, newStatus: 'new', changedBy: null, comment: null, changedAt: d('2026-03-05T00:00:00.000Z') },
    { requestId: IDS.reqInProgress, oldStatus: 'new', newStatus: 'in_progress', changedBy: null, comment: null, changedAt: d('2026-03-06T00:00:00.000Z') },
    { requestId: IDS.reqDone, oldStatus: null, newStatus: 'new', changedBy: null, comment: null, changedAt: d('2026-01-10T00:00:00.000Z') },
    { requestId: IDS.reqDone, oldStatus: 'new', newStatus: 'in_progress', changedBy: null, comment: null, changedAt: d('2026-01-12T00:00:00.000Z') },
    { requestId: IDS.reqDone, oldStatus: 'in_progress', newStatus: 'done', changedBy: null, comment: null, changedAt: d('2026-01-16T00:00:00.000Z') },
  ]);
}
