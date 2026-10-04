import { defineSchema } from './defineSchema'
import { isUuid } from './validators'

export const IdParams = defineSchema({id: isUuid}, {id: "Идентификатор должен быть UUID"});

export const AssigneeParams = defineSchema({ id: isUuid, userId: isUuid }, { id: "Идентификатор должен быть UUID", userId: "Идентификатор специалиста должен быть UUID" });
