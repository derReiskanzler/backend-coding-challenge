import { AuthUserDocument } from '../../documents/auth-user.document';

export abstract class GetUsersDocumentRepositoryInterface {
    public abstract getByUsername(username: string): Promise<AuthUserDocument|null>
}