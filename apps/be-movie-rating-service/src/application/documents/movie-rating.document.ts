import { ReadmodelDocument } from '@backend-monorepo/boilerplate';

export class MovieRatingDocument extends ReadmodelDocument {
    public static ID = 'id';
    public static TITLE = 'title';
    public static DESCRIPTION = 'description';
    public static STARS = 'stars';
    public static ACCOUNT_ID = 'accountId';
    public static CREATED_AT = 'createdAt';

    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly stars: number,
        public readonly accountId: string,
        public readonly createdAt: Date,
    ) {
        super({
            [MovieRatingDocument.ID]: id,
            [MovieRatingDocument.TITLE]: title,
            [MovieRatingDocument.DESCRIPTION]: description,
            [MovieRatingDocument.STARS]: stars,
            [MovieRatingDocument.ACCOUNT_ID]: accountId,
            [MovieRatingDocument.CREATED_AT]: createdAt,
        });
    }
}
