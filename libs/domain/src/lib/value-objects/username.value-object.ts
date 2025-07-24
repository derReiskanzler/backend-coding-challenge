export class Username {
    private constructor(private readonly value: string) {}

    public static fromString(value: string): Username {
        if (value === '') {
            throw new Error('Username cannot be empty');
        }

        value = value.trim();
        
        return new Username(value);
    }

    public toString(): string {
        return this.value;
    }
}