import { Injectable } from '@nestjs/common';
import {
    ReadmodelWriteRepository,
    ReadmodelRepository,
    ReadmodelEnum,
    Metadata,
} from '@backend-monorepo/boilerplate';
import { AuthUserDocument } from '../../../../../application/documents/auth-user.document';

@Injectable()
@ReadmodelRepository(ReadmodelEnum.AUTH_USERS_V1_READMODEL, AuthUserDocument)
export class AuthUsersV1ReadmodelWriteRepository extends ReadmodelWriteRepository {
    public async upsert(user: AuthUserDocument, eventId: string, metadata: Metadata): Promise<void> {
        await this.upsertDocument(user.id, user, eventId, metadata);
    }

    public async deleteById(id: string, eventId: string): Promise<void> {
        await this.deleteDocument(id, eventId);
    }
}
