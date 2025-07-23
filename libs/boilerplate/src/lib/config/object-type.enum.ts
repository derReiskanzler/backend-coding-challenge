/**
 * Enum for object types
 * EVENT_STREAM - Event stream table in database
 * EVENT_STREAM_MAP - Event map that contains a key-value pair where the key is the event name as string and value the domain event class
 * AGGREGATE_STATE_TABLE - Aggregate state table in database
 * AGGREGATE_STATE - Aggregate state class for denormalization from database
 * AGGREGATE_CLASS - Aggregate class to reconstitute from corresponding AGGREGATE_STATE
 * READMODEL_TABLE - Readmodel table in database
 * READMODEL_CLASS - Readmodel class for denormalization from database
 * 
 * READ_MODE - Read mode for the database
 */
export enum ObjectTypeEnum {
    EVENT_STREAM = 'eventStream',
    EVENT_MAPPING = 'eventMapping',
    AGGREGATE_STATE_TABLE = 'aggregateStateTable',
    AGGREGATE_STATE_CLASS = 'aggregateStateClass',
    AGGREGATE_CLASS = 'aggregateClass',
    READMODEL_TABLE = 'readmodelTable',
    READMODEL_CLASS = 'readmodelClass',

    READ_MODE = 'readMode',
}