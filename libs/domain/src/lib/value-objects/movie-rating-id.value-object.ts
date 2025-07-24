import { isUUID } from 'class-validator';

export class MovieRatingId {
    private constructor(private readonly value: string) {}

    public static fromString(value: string): MovieRatingId {
        if (!isUUID(value)) {
            throw new Error(`Invalid argument for movie rating id: ${value}`);
        }

        return new MovieRatingId(value);
    }

    public toString(): string {
        return this.value;
    }
}