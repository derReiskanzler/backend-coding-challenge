/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class DomainEvent {
    public abstract getEventName(): string;

    public abstract getCreatedAt(): Date;

    public normalize(): Record<string, any> {
        const convertKeys = (data: Record<string, any>): Record<string, any> => {
            const converted: Record<string, any> = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const value = data[key];
                    if (value !== undefined) {
                        converted[key] = value instanceof Date
                            ? value.toISOString()
                            : value && typeof value === 'object' && !Array.isArray(value)
                                ? convertKeys(value)
                                : value;
                    }
                }
            }
            return converted;
        };
        return convertKeys(this);
    }

    public static denormalize(dto: Record<string, any>): DomainEvent {
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
        const instance = Object.create(this.prototype);
        Object.assign(instance, convertKeys(dto));
        return instance;
    }
}