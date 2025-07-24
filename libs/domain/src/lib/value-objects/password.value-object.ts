export class Password {
    private constructor(private readonly value: string) {}

    public static fromString(value: string): Password {
        if (value === '') {
            throw new Error('Password cannot be empty');
        }

        if (/\s/.test(value)) {
            throw new Error('Password cannot contain empty spaces');
        }

        if (value.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (!/[a-z]/.test(value)) {
            throw new Error('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(value)) {
            throw new Error('Password must contain at least one uppercase letter');
        }

        if (!/\W/.test(value)) {
            throw new Error('Password must contain at least one special character');
        }

        if (!/[0-9]/.test(value)) {
            throw new Error('Password must contain at least one number');
        }

        return new Password(value);
    }

    public toString(): string {
        return this.value;
    }
}