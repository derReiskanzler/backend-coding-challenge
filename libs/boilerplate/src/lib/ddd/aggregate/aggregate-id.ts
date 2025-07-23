export class AggregateId {
    private constructor(private readonly id: string) {}

    public static fromString(value: string): AggregateId {
        return new AggregateId(value);
    }

    public toString(): string {
        return this.id;
    }
}