export class Description {
    private constructor(private readonly value: string) {}

    public static fromString(value: string): Description {
        if (value === '') {
            throw new Error('Description cannot be empty');
        }

        return new Description(value);
    }

    public toString(): string {
        return this.value;
    }

    public equals(other: Description): boolean {
        return this.value === other.value;
    }
}