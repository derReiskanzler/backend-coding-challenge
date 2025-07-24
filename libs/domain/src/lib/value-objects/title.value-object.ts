export class Title {
    private constructor(private readonly value: string) {}

    public static fromString(value: string): Title {
        if (value === '') {
            throw new Error('Title cannot be empty');
        }

        value = value.trim();
        
        return new Title(value);
    }

    public toString(): string {
        return this.value;
    }

    public equals(other: Title): boolean {
        return this.value === other.value;
    }
}