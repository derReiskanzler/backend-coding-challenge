import { IQueryHandler, QueryHandler } from '@backend-monorepo/boilerplate';
import { GetAccountQuery } from './get-account.query';
import { GetAccountDocumentRepositoryInterface } from './get-account-document.repository.interface';
import { AuthUserDocumentNotFoundException } from '../../exceptions/auth-user-document-not-found.exception';
import { AuthUserDocument } from '../../documents/auth-user.document';

@QueryHandler(GetAccountQuery)
export class GetAccountQueryHandler extends IQueryHandler<GetAccountQuery,AuthUserDocument> {
    constructor(
        private readonly accountReadRepository: GetAccountDocumentRepositoryInterface,
    ) {
        super();
    }

    public async execute(query: GetAccountQuery): Promise<AuthUserDocument> {
        const account = await this.accountReadRepository.getById(query.getId().toString());
        if (!account) {
            throw AuthUserDocumentNotFoundException.withId(query.getId().toString());
        }
        
        return account;
    }
}
