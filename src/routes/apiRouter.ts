import { Router } from 'express'

import Paths from '@src/common/constants/Paths'

import { IdParams } from '@src/common/utils/common'
import { EquipmentSchemas } from '@src/common/utils/equipment.validators'
import { RequestSchemas } from '@src/common/utils/requests.validators'
import EquipmentController from '@src/controllers/EquipmentController'
import HealthRoutes from '@src/controllers/HelathController'
import MaintenanceController from '@src/controllers/MaintenanceRequestsController'
import { validate } from '@src/middlewares/validate'

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

apiRouter.get(Paths.Health._, HealthRoutes.health);

// ----------------------- Add Equipment --------------------------------- //

const equipmentRouter = Router();

equipmentRouter.get(Paths.Equipment.Get, validate({query: EquipmentSchemas.listQuery}), EquipmentController.get)
equipmentRouter.post(Paths.Equipment.Add, validate({body: EquipmentSchemas.create}), EquipmentController.add)
equipmentRouter.get(Paths.Equipment.GetId, validate({params: IdParams}),EquipmentController.getById)
equipmentRouter.patch(Paths.Equipment.Patch, validate({params: IdParams, body: EquipmentSchemas.patch}), EquipmentController.patch)
equipmentRouter.delete(Paths.Equipment.Delete, validate({params: IdParams}), EquipmentController.delete)
equipmentRouter.get(Paths.Equipment.GetRequests, validate({params: IdParams}), EquipmentController.getRequest)
equipmentRouter.get(Paths.Equipment.GetWeather,  validate({params: IdParams}),  EquipmentController.getWeather)

apiRouter.use(Paths.Equipment._, equipmentRouter);

// ----------------------- Add Mainteance --------------------------------- //

const maintenanceRouter = Router();

maintenanceRouter.get(Paths.Requests.Get, validate({query: RequestSchemas.listQuery}), MaintenanceController.get)
maintenanceRouter.post(Paths.Requests.Add, validate({body: RequestSchemas.create}), MaintenanceController.add)
maintenanceRouter.get(Paths.Requests.GetId, validate({params: IdParams}), MaintenanceController.getById)
maintenanceRouter.patch(Paths.Requests.Patch, validate({params: IdParams, body: RequestSchemas.patch}), MaintenanceController.patch)
maintenanceRouter.patch(Paths.Requests.PatchStatus, validate({params: IdParams, body: RequestSchemas.status}), MaintenanceController.patchStatus)
maintenanceRouter.delete(Paths.Requests.Delete, validate({params: IdParams}), MaintenanceController.delete)

apiRouter.use(Paths.Requests._, maintenanceRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;
