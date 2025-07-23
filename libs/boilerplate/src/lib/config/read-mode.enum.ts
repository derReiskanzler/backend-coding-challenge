/**
 * Enum for read modes on the database
 * FROM_STATE - Load aggregate from state
 * FROM_EVENTS - Load/Replay aggregate from events
*/
export enum ReadModeEnum {
    FROM_STATE = 'FROM_STATE',
    FROM_EVENTS = 'FROM_EVENTS',
}

export type ReadMode = 'FROM_STATE' | 'FROM_EVENTS';