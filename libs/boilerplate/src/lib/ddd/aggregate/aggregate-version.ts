export class AggregateVersion {
    private constructor(private readonly version: number) {}

    public static zero(): AggregateVersion {
        return new AggregateVersion(0);
    }

    public static fromNumber(value: number): AggregateVersion {
        return new AggregateVersion(value);
    }

    public toNumber(): number {
        return this.version;
    }

    public increment(): AggregateVersion {
        return new AggregateVersion(this.version + 1);
    }

    public subtract(value: number): AggregateVersion {
        return new AggregateVersion(this.version - value);
    }
}