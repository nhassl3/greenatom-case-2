import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { afterAll, beforeAll } from 'vitest';

import app from '@src/app';
import { sequelize } from '@src/db/models';
import { assertTestDb } from './guard';

/******************************************************************************
                                    Run
******************************************************************************/

let agent: TestAgent<Test>;

beforeAll(() => {
  assertTestDb();
  agent = supertest.agent(app);
});

afterAll(async () => {
  await sequelize.close();
});

/******************************************************************************
                                    Export
******************************************************************************/

export { agent };
