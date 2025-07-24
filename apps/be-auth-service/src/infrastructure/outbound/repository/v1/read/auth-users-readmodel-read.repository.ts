import { Injectable } from '@nestjs/common';
import {
    ReadmodelRepository,
    ReadmodelEnum,
    ReadmodelReadRepository,
} from '@backend-monorepo/boilerplate';
import { GetUsersDocumentRepositoryInterface as GetSignUpReadmodelRepositoryInterface } from '../../../../../application/use-cases/sign-up/get-users-document.repository.interface';
import { AuthUserDocument } from '../../../../../application/documents/auth-user.document';

@Injectable()
@ReadmodelRepository(ReadmodelEnum.AUTH_USERS_V1_READMODEL, AuthUserDocument)
export class AuthUsersV1ReadmodelReadRepository extends ReadmodelReadRepository implements GetSignUpReadmodelRepositoryInterface {
    public async getById(id: string): Promise<AuthUserDocument|null> {
        return await this.getDocument<AuthUserDocument>({ id });
    }
    
    public async getByUsername(username: string): Promise<AuthUserDocument|null> {
        return await this.getDocument<AuthUserDocument>({ body: { username } });
    }
}