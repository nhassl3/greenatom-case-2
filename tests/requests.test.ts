import { beforeEach, describe, expect, it } from 'vitest'

import { REQUEST_STATUSES } from '@src/common/utils/validators'
import RequestRepo from '@src/repos/MaintenanceRequestRepo'
import AssigneeRepo from '@src/repos/RequestAssigneeRepo'
import { AllowedStatusTransitions } from '@src/services/MaintenanceRequestService'

import { agent } from './support/agent'
import { IDS, seed } from './support/fixtures'

const validRequest = {
  equipmentId: IDS.turbine,
  title: 'Replace turbine blades',
  priority: 'medium',
  plannedAt: '2026-12-01',
};

beforeEach(seed);

describe('POST /api/requests', () => {
  it('201: статус всегда new, служебные поля из тела игнорируются', async () => {
    const res = await agent.post('/api/requests').send({
      ...validRequest, status: 'done', id: 'x', createdAt: '1999-01-01', unknown: true,
    });
    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/api/requests/${res.body.data.id}`);
    expect(res.body.data).toMatchObject({ status: 'new', title: validRequest.title, plannedAt: '2026-12-01T00:00:00.000Z' });
    expect(res.body.data.id).not.toBe('x');
    expect(res.body.data.createdAt).not.toBe('1999-01-01');
    expect(res.body.data).not.toHaveProperty('unknown');
  });

  it('404, если оборудования не существует', async () => {
    const res = await agent.post('/api/requests').send({ ...validRequest, equipmentId: IDS.missing });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('EQUIPMENT_NOT_FOUND');
  });

  it('422 с перечнем полей', async () => {
    const res = await agent.post('/api/requests').send({ equipmentId: 'nope', title: 'abc', priority: 'urgent' });
    expect(res.status).toBe(422);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['equipmentId', 'title', 'priority']));
  });
});

describe('GET /api/requests', () => {
  it('фильтр по статусу и сортировка по смыслу приоритета', async () => {
    const res = await agent.get('/api/requests?sort=-priority');
    expect(res.body.data.map((r: { priority: string }) => r.priority)).toEqual(['critical', 'high', 'low']);
    const open = await agent.get('/api/requests?status=in_progress');
    expect(open.body.data.map((r: { id: string }) => r.id)).toEqual([IDS.reqInProgress]);
  });

  it('фильтр по плановой дате', async () => {
    const res = await agent.get('/api/requests?plannedFrom=2026-03-01&plannedTo=2026-03-31');
    expect(res.body.data.map((r: { id: string }) => r.id)).toEqual([IDS.reqInProgress]);
  });
});

describe('PATCH /api/requests/:id', () => {
  it('меняет поля, но не статус и не equipmentId', async () => {
    const res = await agent.patch(`/api/requests/${IDS.reqNew}`)
      .send({ title: 'Updated title', status: 'done', equipmentId: IDS.sensor });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ title: 'Updated title', status: 'new', equipmentId: IDS.turbine });
    expect(res.body.data.updatedAt).not.toBe('2026-03-01T00:00:00.000Z');
  });

  it('404 для несуществующей заявки', async () => {
    const res = await agent.patch(`/api/requests/${IDS.missing}`).send({ title: 'Updated title' });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/requests/:id/status', () => {
  const pairs = REQUEST_STATUSES.flatMap((from) => REQUEST_STATUSES.map((to) => [from, to] as const));

  it.each(pairs)('%s → %s', async (from, to) => {
    await RequestRepo.update(IDS.reqNew, { status: from });
    await AssigneeRepo.replaceForRequest(IDS.reqNew, [{ technicianId: IDS.techLead, role: 'lead', plannedHours: 1 }]); // in_progress требует бригаду
    const res = await agent.patch(`/api/requests/${IDS.reqNew}/status`).send({ status: to });
    if (AllowedStatusTransitions[from].includes(to)) {
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(to);
    } else {
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    }
  });

  it('422 для неизвестного статуса', async () => {
    const res = await agent.patch(`/api/requests/${IDS.reqNew}/status`).send({ status: 'closed' });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/requests/:id', () => {
  it('204, затем 404', async () => {
    expect((await agent.delete(`/api/requests/${IDS.reqDone}`)).status).toBe(204);
    expect((await agent.delete(`/api/requests/${IDS.reqDone}`)).status).toBe(404);
  });
});

describe('POST /api/requests/bulk', () => {
  it('207 с результатом по каждому элементу', async () => {
    const res = await agent.post('/api/requests/bulk').send({
      items: [validRequest, { title: 'x' }, { ...validRequest, equipmentId: IDS.missing }],
    });
    expect(res.status).toBe(207);
    expect(res.body.data).toMatchObject({ total: 3, created: 1, failed: 2 });
    expect(res.body.data.results.map((r: { status: number }) => r.status)).toEqual([201, 422, 404]);
    expect(res.body.data.results[1].error.details.length).toBeGreaterThan(0);
  });

  it('422 для пустого массива', async () => {
    const res = await agent.post('/api/requests/bulk').send({ items: [] });
    expect(res.status).toBe(422);
  });
});
