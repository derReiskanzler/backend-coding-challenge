import { ReadmodelDocument } from '@backend-monorepo/boilerplate';

export class AuthUserDocument extends ReadmodelDocument {
    public static ID = 'id';
    public static USERNAME = 'username';
    public static CREATED_AT = 'createdAt';

    constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly createdAt: Date,
    ) {
        super({
            [AuthUserDocument.ID]: id,
            [AuthUserDocument.USERNAME]: username,
            [AuthUserDocument.CREATED_AT]: createdAt,
        });
    }
}
