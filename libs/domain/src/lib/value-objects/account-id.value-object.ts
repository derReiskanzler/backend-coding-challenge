import { isUUID } from 'class-validator';

export class AccountId {
    private constructor(private readonly value: string) {}

    public static fromString(value: string): AccountId {
        if (!isUUID(value)) {
            throw new Error(`Invalid argument for account id: ${value}`);
        }

        return new AccountId(value);
    }

    public toString(): string {
        return this.value;
    }
}