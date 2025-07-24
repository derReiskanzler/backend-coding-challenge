import { AuthUserDocument } from '../../documents/auth-user.document';

export abstract class GetAccountDocumentRepositoryInterface {
    public abstract getById(id: string): Promise<AuthUserDocument|null>
}