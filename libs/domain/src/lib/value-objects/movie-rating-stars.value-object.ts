export class MovieRatingStars {
    private constructor(private readonly value: number) {}

    public static fromNumber(value: number): MovieRatingStars {
        if (value < 0 || value > 5) {
            throw new Error(`Invalid argument for movie rating stars: ${value}`);
        }

        return new MovieRatingStars(value);
    }

    public toNumber(): number {
        return this.value;
    }

    public toString(): string {
        return this.value.toString();
    }
}