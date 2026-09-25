import jsonfile from 'jsonfile'
import tspo from 'tspo'

import EnvVars, { NodeEnvs } from '@src/common/constants/env'
import { IEquipment } from '@src/models/Equipment.model'
import { IMaintenanceRequest } from '@src/models/Maintenance.model'

/******************************************************************************
                                Constants
******************************************************************************/

const DATABASE_FILE_PATH =
  __dirname +
  '/common' +
  (EnvVars.NodeEnv === NodeEnvs.TEST
    ? '/database.test.json'
    : '/database.json');

/******************************************************************************
                                Types
******************************************************************************/

type Database = {
  equipments: IEquipment[];
  maintenances: IMaintenanceRequest[];
};

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Fetch the json from the file.
 */
async function openDb(): Promise<Database> {
  const db = await (jsonfile.readFile(DATABASE_FILE_PATH) as Promise<Database>);
  if (!('maintenances' in db) || !('equipments' in db)) {
    return tspo.addEntries(db, [
      ['equipments', []],
      ['maintenances', []],
    ]);
  }
  return db;
}

/**
 * Update the file.
 */
function saveDb(db: Database): Promise<void> {
  return jsonfile.writeFile(DATABASE_FILE_PATH, db);
}

/**
 * Empty the database
 */
function cleanDb(): Promise<void> {
  return jsonfile.writeFile(DATABASE_FILE_PATH, {});
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  openDb,
  saveDb,
  cleanDb,
} as const;
