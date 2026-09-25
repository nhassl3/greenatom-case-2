import { Router } from 'express'

import Paths from '@src/common/constants/Paths'

import EquipmentRoutes from '@src/controllers/EquipmentController'
import HealthRoutes from '@src/controllers/HelathController'
import MaintenanceRoutes from '@src/controllers/MaintenanceRequestsController'

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

apiRouter.get(Paths.Health._, HealthRoutes.health);

// ----------------------- Add Equipment --------------------------------- //

const equipmentRouter = Router();

equipmentRouter.get(Paths.Equipment.Get, EquipmentRoutes.get)
equipmentRouter.post(Paths.Equipment.Add, EquipmentRoutes.add)
equipmentRouter.get(Paths.Equipment.GetId, EquipmentRoutes.getById)
equipmentRouter.patch(Paths.Equipment.Patch, EquipmentRoutes.patch)
equipmentRouter.delete(Paths.Equipment.Delete, EquipmentRoutes.delete)
equipmentRouter.get(Paths.Equipment.GetRequests, EquipmentRoutes.getRequest)
equipmentRouter.get(Paths.Equipment.GetWeather, EquipmentRoutes.getWeather)

apiRouter.use(Paths.Equipment._, equipmentRouter);

// ----------------------- Add Mainteance --------------------------------- //

const maintenanceRouter = Router();

maintenanceRouter.get(Paths.Requests.Get, MaintenanceRoutes.get)
maintenanceRouter.post(Paths.Requests.Add, MaintenanceRoutes.add)
maintenanceRouter.get(Paths.Requests.GetId, MaintenanceRoutes.getById)
maintenanceRouter.patch(Paths.Requests.Patch, MaintenanceRoutes.patch)
maintenanceRouter.patch(Paths.Requests.PatchStatus, MaintenanceRoutes.patchStatus)
maintenanceRouter.delete(Paths.Requests.Delete, MaintenanceRoutes.delete)

apiRouter.use(Paths.Requests._, maintenanceRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;
