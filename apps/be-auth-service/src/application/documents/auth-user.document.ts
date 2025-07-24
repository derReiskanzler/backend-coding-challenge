import { ReadmodelDocument } from '@backend-monorepo/boilerplate';

export class AuthUserDocument extends ReadmodelDocument {
    public static ID = 'id';
    public static USERNAME = 'username';

    constructor(
        public readonly id: string,
        public readonly username: string,
    ) {
        super({
            [AuthUserDocument.ID]: id,
            [AuthUserDocument.USERNAME]: username,
        });
    }
}
