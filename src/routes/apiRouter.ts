import { Router } from 'express'

import Paths from '@src/common/constants/Paths'
import { AssigneeParams, IdParams } from '@src/common/utils/common'
import { EquipmentSchemas } from '@src/common/utils/equipment.validators'
import { ReportSchemas } from '@src/common/utils/reports.validators'
import { RequestSchemas } from '@src/common/utils/requests.validators'
import EquipmentController from '@src/controllers/EquipmentController'
import HealthController from '@src/controllers/HealthController'
import MaintenanceController from '@src/controllers/MaintenanceRequestsController'
import ReportsController from '@src/controllers/ReportsController'
import SitesController from '@src/controllers/SitesController'
import { requireApiKey } from '@src/middlewares/apiKey'
import { validate } from '@src/middlewares/validate'

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

apiRouter.get(Paths.Health._, HealthController.health);

apiRouter.use(requireApiKey);

// ----------------------- Add Equipment --------------------------------- //

const equipmentRouter = Router();

equipmentRouter.get(Paths.Equipment.Get, validate({ query: EquipmentSchemas.listQuery }), EquipmentController.list);
equipmentRouter.post(Paths.Equipment.Add, validate({ body: EquipmentSchemas.create }), EquipmentController.create);
equipmentRouter.get(Paths.Equipment.GetId, validate({ params: IdParams }), EquipmentController.getById);
equipmentRouter.patch(Paths.Equipment.Patch, validate({ params: IdParams, body: EquipmentSchemas.patch }), EquipmentController.patch);
equipmentRouter.delete(Paths.Equipment.Delete, validate({ params: IdParams }), EquipmentController.remove);
equipmentRouter.get(Paths.Equipment.GetRequests, validate({ params: IdParams, query: RequestSchemas.equipmentListQuery }), EquipmentController.listRequests);
equipmentRouter.get(Paths.Equipment.GetWeather, validate({ params: IdParams }), EquipmentController.getWeather);

apiRouter.use(Paths.Equipment._, equipmentRouter);

// ----------------------- Add Mainteance --------------------------------- //

const maintenanceRouter = Router();

maintenanceRouter.get(Paths.Requests.Get, validate({ query: RequestSchemas.listQuery }), MaintenanceController.list);
maintenanceRouter.post(Paths.Requests.Add, validate({ body: RequestSchemas.create }), MaintenanceController.create);
maintenanceRouter.post(Paths.Requests.Bulk, validate({ body: RequestSchemas.bulk }), MaintenanceController.bulk);
maintenanceRouter.get(Paths.Requests.GetId, validate({ params: IdParams }), MaintenanceController.getById);
maintenanceRouter.patch(Paths.Requests.Patch, validate({ params: IdParams, body: RequestSchemas.patch }), MaintenanceController.patch);
maintenanceRouter.patch(Paths.Requests.PatchStatus, validate({ params: IdParams, body: RequestSchemas.status }), MaintenanceController.patchStatus);
maintenanceRouter.delete(Paths.Requests.Delete, validate({ params: IdParams }), MaintenanceController.remove);

maintenanceRouter.post(Paths.Requests.Assignees, validate({ params: IdParams, body: RequestSchemas.assignees }), MaintenanceController.assign);
maintenanceRouter.delete(Paths.Requests.Unassign, validate({ params: AssigneeParams }), MaintenanceController.unassign);
maintenanceRouter.get(Paths.Requests.History, validate({ params: IdParams }), MaintenanceController.history);

apiRouter.use(Paths.Requests._, maintenanceRouter);

// ----------------------- Sites & Reports --------------------------------- //

const sitesRouter = Router();
sitesRouter.get(Paths.Sites.Summary, validate({ params: IdParams }), SitesController.summary);
apiRouter.use(Paths.Sites._, sitesRouter);

const reportsRouter = Router();
reportsRouter.get(Paths.Reports.EquipmentLoad, validate({ query: ReportSchemas.equipmentLoad }), ReportsController.equipmentLoad);
apiRouter.use(Paths.Reports._, reportsRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;
