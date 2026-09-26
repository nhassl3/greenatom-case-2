// Types

export interface IMaintenanceRequest {
	id: string; // @PK uuid
	equipmentId: string; // @FK
	title: string; // @REQUIRED
	description: string;
	priority: string; // CHECK IN ('low', 'medium', 'high', 'critical')
	status: string; // CHECK IN ('new', 'in_progress', 'done', 'rejected') BY DEFAULT 'new'
	plannedAt?: Date | string // ISO Date-time
	createdAt: Date | string // ISO Date-time
	updatedAt: Date | string // ISO Date-time
}

export type IMaintenanceRequestPatch = Partial<Omit<IMaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'equipmentId' | 'status'>>

// new -> in_progress -> done; new -> rejected; new -> in_progress -> rejected;