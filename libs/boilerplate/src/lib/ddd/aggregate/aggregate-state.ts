/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class AggregateState {
    public constructor(recordData: Record<string, any>) {
        if (recordData) {
            this.setRecordData(recordData);
        }

        this.initialize();
    }

    /**
     * Create an instance of the AggregateState class from a recordData object (should contain native types)
     * Why the first argument is named this:
     * when defining static methods in Typescript that need to refer to the class type,
     * the first parameter can be named this. This is a special syntax that allows the method to know
     * about the class type it is being called on.
     * It is not an actual argument that you pass when calling the method; instead, it provides type information.
     * 
     * Why recordData can be passed as the first argument:
     * When you call this static method, you do not pass the this parameter explicitly.
     * TypeScript automatically binds this to the class type.
     * Therefore, the first actual argument you pass is recordData.
     */
    public static fromRecordData<T extends AggregateState>(this: new (recordData: Record<string, any>) => T, recordData: Record<string, any>): T {
        return new this(recordData);
    }

    /**
     * Create a copy of the current instance and assigns new data to the copy
     * @param recordData 
     * @returns 
     */
    public with<T extends AggregateState>(recordData: Record<string, any>): T {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    
        copy.setRecordData(recordData);
    
        return copy as T;
    }
    
    /**
     * Dynamically sets properties based on the recordData object
     */
    public setRecordData(recordData: Record<string, any>): void {
        for (const key in recordData) {
            if (Object.prototype.hasOwnProperty.call(recordData, key)) {
                (this as unknown as Record<string, unknown>)[key] = recordData[key];
            }
        }
    }

    /**
     * Returns the current properties in an object the same way they were passed to the constructor
     */
    public toRecordData(): Record<string, any> {
        const recordData: Record<string, any> = {};
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                recordData[key] = (this as unknown as Record<string, unknown>)[key];
            }
        }
        return recordData;
    }

    /**
     * Is called when the state is instantiated, but it is called after the recordData/state-information has been set,
     * so that the state can be initialized with default values, when reading from the aggregate/replaying the events
     */
    protected abstract initialize(): void;
}