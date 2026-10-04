import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RequestAssignee } from '@src/db/models'
import AssigneeRepo from '@src/repos/RequestAssigneeRepo'

import { agent } from './support/agent'
import { IDS, seed } from './support/fixtures'

beforeEach(seed);

const crew = (...items: [string, 'lead' | 'member', number][]) => ({
  assignees: items.map(([technicianId, role, plannedHours]) => ({ technicianId, role, plannedHours })),
});

const crewOf = async (requestId: string) =>
  (await RequestAssignee.findAll({ where: { requestId }, order: [['technicianId', 'ASC']] })).map((a) => [a.technicianId, a.role]);

describe('POST /api/requests/:id/assignees', () => {
  it('201: заменяет бригаду, в карточке исполнители с ролью и часами', async () => {
    const res = await agent.post(`/api/requests/${IDS.reqNew}/assignees`)
      .send(crew([IDS.techLead, 'lead', 2.5], [IDS.techMember, 'member', 4]));
    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/api/requests/${IDS.reqNew}`);
    expect(res.body.data.assignees).toEqual(expect.arrayContaining([
      { technicianId: IDS.techLead, fullName: 'Lead Tech', role: 'lead', plannedHours: 2.5 },
      { technicianId: IDS.techMember, fullName: 'Member Tech', role: 'member', plannedHours: 4 },
    ]));
    const card = await agent.get(`/api/requests/${IDS.reqNew}`);
    expect(card.body.data.assignees).toHaveLength(2);
  });

  it('повторное назначение полностью заменяет прежнюю бригаду', async () => {
    const res = await agent.post(`/api/requests/${IDS.reqInProgress}/assignees`).send(crew([IDS.techFree, 'lead', 1]));
    expect(res.status).toBe(201);
    expect(await crewOf(IDS.reqInProgress)).toEqual([[IDS.techFree, 'lead']]);
  });

  it('404: заявка или специалист не найдены', async () => {
    const noRequest = await agent.post(`/api/requests/${IDS.missing}/assignees`).send(crew([IDS.techLead, 'lead', 1]));
    expect(noRequest.status).toBe(404);
    expect(noRequest.body.error.code).toBe('REQUEST_NOT_FOUND');

    const noTech = await agent.post(`/api/requests/${IDS.reqNew}/assignees`).send(crew([IDS.missing, 'lead', 1]));
    expect(noTech.status).toBe(404);
    expect(noTech.body.error.code).toBe('TECHNICIAN_NOT_FOUND');
    expect(await crewOf(IDS.reqNew)).toEqual([]);
  });

  it('409: специалист указан дважды', async () => {
    const res = await agent.post(`/api/requests/${IDS.reqNew}/assignees`)
      .send(crew([IDS.techLead, 'lead', 1], [IDS.techLead, 'member', 1]));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_ASSIGNEE');
  });

  it.each([
    ['нет lead', crew([IDS.techLead, 'member', 1])],
    ['два lead', crew([IDS.techLead, 'lead', 1], [IDS.techMember, 'lead', 1])],
    ['часы 0', crew([IDS.techLead, 'lead', 0])],
    ['часы больше 999.99', crew([IDS.techLead, 'lead', 1000])],
    ['пустой список', { assignees: [] }],
    ['не UUID', crew(['nope', 'lead', 1])],
  ])('422: %s', async (_, body) => {
    const res = await agent.post(`/api/requests/${IDS.reqNew}/assignees`).send(body);
    expect(res.status).toBe(422);
    expect(res.body.error.details[0].field).toBe('assignees');
  });

  it('откат транзакции: при сбое после удаления прежняя бригада остаётся', async () => {
    vi.spyOn(AssigneeRepo, 'replaceForRequest').mockImplementationOnce(async (requestId, _items, opts) => {
      await RequestAssignee.destroy({ where: { requestId }, transaction: opts?.tx }); // как в реальной реализации
      throw new Error('сбой между destroy и bulkCreate');
    });
    const before = await crewOf(IDS.reqInProgress);
    const res = await agent.post(`/api/requests/${IDS.reqInProgress}/assignees`).send(crew([IDS.techFree, 'lead', 1]));
    expect(res.status).toBe(500);
    expect(await crewOf(IDS.reqInProgress)).toEqual(before);
    vi.restoreAllMocks();
  });
});

describe('DELETE /api/requests/:id/assignees/:userId', () => {
  it('204: снимает члена бригады', async () => {
    const res = await agent.delete(`/api/requests/${IDS.reqInProgress}/assignees/${IDS.techMember}`);
    expect(res.status).toBe(204);
    expect(await crewOf(IDS.reqInProgress)).toEqual([[IDS.techLead, 'lead']]);
  });

  it('404: заявка не найдена или специалист не назначен', async () => {
    expect((await agent.delete(`/api/requests/${IDS.missing}/assignees/${IDS.techLead}`)).status).toBe(404);
    const res = await agent.delete(`/api/requests/${IDS.reqInProgress}/assignees/${IDS.techFree}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ASSIGNEE_NOT_FOUND');
  });

  it('422: нельзя снять lead, пока есть другие исполнители', async () => {
    const res = await agent.delete(`/api/requests/${IDS.reqInProgress}/assignees/${IDS.techLead}`);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('LEAD_REMOVAL_FORBIDDEN');
  });

  it('409: нельзя снять последнего исполнителя у заявки в работе', async () => {
    await agent.delete(`/api/requests/${IDS.reqInProgress}/assignees/${IDS.techMember}`);
    const res = await agent.delete(`/api/requests/${IDS.reqInProgress}/assignees/${IDS.techLead}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('LAST_ASSIGNEE');
  });

  it('204: последнего исполнителя заявки new снять можно', async () => {
    await agent.post(`/api/requests/${IDS.reqNew}/assignees`).send(crew([IDS.techLead, 'lead', 1]));
    expect((await agent.delete(`/api/requests/${IDS.reqNew}/assignees/${IDS.techLead}`)).status).toBe(204);
  });
});

describe('смена статуса и журнал', () => {
  it('409 NO_ASSIGNEES: в работу нельзя без бригады', async () => {
    const res = await agent.patch(`/api/requests/${IDS.reqNew}/status`).send({ status: 'in_progress' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NO_ASSIGNEES');
  });

  it('создание заявки и смены статуса пишут журнал по порядку', async () => {
    const created = await agent.post('/api/requests').send({ equipmentId: IDS.turbine, title: 'History check', priority: 'low' });
    const id = created.body.data.id as string;
    await agent.post(`/api/requests/${id}/assignees`).send(crew([IDS.techLead, 'lead', 1]));
    expect((await agent.patch(`/api/requests/${id}/status`).send({ status: 'in_progress' })).status).toBe(200);
    expect((await agent.patch(`/api/requests/${id}/status`).send({ status: 'done' })).status).toBe(200);

    const res = await agent.get(`/api/requests/${id}/history`);
    expect(res.status).toBe(200);
    expect(res.body.data.map((h: { oldStatus: string | null; newStatus: string }) => [h.oldStatus, h.newStatus]))
      .toEqual([[null, 'new'], ['new', 'in_progress'], ['in_progress', 'done']]);
  });

  it('недопустимый переход не пишет в журнал', async () => {
    const res = await agent.patch(`/api/requests/${IDS.reqDone}/status`).send({ status: 'new' });
    expect(res.status).toBe(409);
    expect((await agent.get(`/api/requests/${IDS.reqDone}/history`)).body.data).toHaveLength(3);
  });

  it('404 для несуществующей заявки', async () => {
    expect((await agent.get(`/api/requests/${IDS.missing}/history`)).status).toBe(404);
  });
});
