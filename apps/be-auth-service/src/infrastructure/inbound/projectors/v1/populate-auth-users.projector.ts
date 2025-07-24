/* eslint-disable no-case-declarations */
import { Logger } from '@nestjs/common';
import { BaseStreamEvent, EventStreamEnum, EventStreamListener, EventStreamPayload, Projector } from '@backend-monorepo/boilerplate';
import { UsernameUpdatedEvent, UserSignedUpEvent } from '@backend-monorepo/domain';
import { AuthUsersV1ReadmodelWriteRepository } from '../../../outbound/repository/v1/write/auth-users-readmodel-write.repository';
import { AuthUserDocument } from '../../../../application/documents/auth-user.document';
import { AuthUsersV1ReadmodelReadRepository } from '../../../outbound/repository/v1/read/auth-users-readmodel-read.repository';

@Projector()
export class PopulateAuthUsersProjector {
    private readonly logger = new Logger(PopulateAuthUsersProjector.name);
    
    constructor(
        private readonly usersReadmodelWriteRepository: AuthUsersV1ReadmodelWriteRepository,
        private readonly usersReadmodelReadRepository: AuthUsersV1ReadmodelReadRepository,
    ) {}

    @EventStreamListener(EventStreamEnum.AUTH_ACCOUNTS_V1_STREAM)
    public async handleAccountsStreamEvents(@EventStreamPayload() event: BaseStreamEvent): Promise<void> {
        switch (event.eventName) {
            case UserSignedUpEvent.name:
                this.logger.log(`Received: '${event.eventName}'`);
                await this.usersReadmodelWriteRepository.upsert(
                    new AuthUserDocument(
                        event.payload['id'],
                        event.payload['username'],
                        event.createdAt,
                    ),
                    event.eventId,
                    event.meta,
                );
                break;
            case UsernameUpdatedEvent.name:
                this.logger.log(`Received: '${event.eventName}'`);
                const user = await this.usersReadmodelReadRepository.getById(event.payload['id']);
                if (user) {
                    await this.usersReadmodelWriteRepository.upsert(
                        user.with({
                            [AuthUserDocument.USERNAME]: event.payload['username'],
                        }),
                        event.eventId,
                        event.meta,
                    );
                }
                break;
        }
    }
}