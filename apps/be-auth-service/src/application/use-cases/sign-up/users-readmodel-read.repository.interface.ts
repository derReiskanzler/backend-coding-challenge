import { AuthUserDocument } from '../../documents/auth-user.document';

export abstract class UsersReadmodelReadRepositoryInterface {
    public abstract getByUsername(username: string): Promise<AuthUserDocument|null>
}