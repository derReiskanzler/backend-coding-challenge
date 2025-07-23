
/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class ReadmodelDocument {
    public constructor(recordData: Record<string, any>) {
        if (recordData) {
            this.setRecordData(recordData);
        }
    }

    /**
     * Create an instance of the ReadmodelDocument class from a recordData object (should contain native types)
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
    public static fromRecordData<T extends ReadmodelDocument>(this: new (recordData: Record<string, any>) => T, recordData: Record<string, any>): T {
        return new this(recordData);
    }

    /**
     * Create a copy of the current instance and assigns new data to the copy
     * @param recordData 
     * @returns 
     */
    public with<T extends ReadmodelDocument>(recordData: Record<string, any>): T {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    
        const mergedData = { ...this.toRecordData(), ...recordData };
        copy.setRecordData(mergedData);
    
        return copy as T;
    }

    /**
     * Dynamically sets properties based on the recordData object, including nested keys,
     * and filters out properties with undefined values.
     */
    public setRecordData(recordData: Record<string, any>): void {
        const convertKeys = (data: Record<string, any>): Record<string, any> => {
            const converted: Record<string, any> = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const value = data[key];
                    if (value !== undefined) {
                        converted[key] = value instanceof Date
                            ? value
                            : value && typeof value === 'object' && !Array.isArray(value)
                                ? convertKeys(value)
                                : value;
                    }
                }
            }
            return converted;
        };

        const convertedData = convertKeys(recordData);
        Object.assign(this, convertedData);
    }

    /**
     * Returns the current properties in an object the same way they were passed to the constructor, including nested keys,
     * and filters out properties with undefined values.
     */
    public toRecordData(): Record<string, any> {
        const convertKeys = (data: Record<string, any>): Record<string, any> => {
            const converted: Record<string, any> = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const value = data[key];
                        converted[key] = value instanceof Date
                            ? value
                            : value && typeof value === 'object' && !Array.isArray(value)
                                ? convertKeys(value as Record<string, any>)
                                : value;
                }
            }
            return converted;
        };

        return convertKeys(this as unknown as Record<string, any>);
    }
}