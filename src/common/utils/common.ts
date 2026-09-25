import { defineSchema } from './defineSchema'
import { isUuid } from './validators'

export const IdParams = defineSchema({id: isUuid}, {id: "Идентификатор должен быть UUID"});