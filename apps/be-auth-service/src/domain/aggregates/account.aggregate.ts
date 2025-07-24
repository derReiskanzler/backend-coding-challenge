import {
    AccountId,
    Password,
    UserSignedUpEvent,
    Username,
    UsernameUpdatedEvent,
} from '@backend-monorepo/domain';
import { AggregateId, AggregateRoot, Encryptor } from '@backend-monorepo/boilerplate';
import { AccountState } from './account.state';
import { AccountAlreadyExistsException } from '../exceptions/account-already-exists.exception';

export class Account extends AggregateRoot {
    protected override state: AccountState;

    public getAggregateId(): AggregateId {
        return AggregateId.fromString(this.state.getId().toString());
    }

    public override getState(): AccountState {
        return this.state;
    }

    public static signUp(
        existingUsername: Username|null,
        dto: {
            accountId: AccountId,
            username: Username,
            password: Password,
        },
    ): Account {
        if (existingUsername !== null) {
            throw AccountAlreadyExistsException.withUsername(dto.username.toString());
        }

        const crypted = Encryptor.encrypt(dto.password.toString());

        const account = new Account();
        account.recordThat(
            UserSignedUpEvent.create(
                dto.accountId.toString(),
                dto.username.toString(),
                crypted.passwordHash,
                crypted.salt,
            ),
        );

        return account;
    }

    public onUserSignedUpEvent(event: UserSignedUpEvent): void {
        this.state = AccountState.fromRecordData({
            [AccountState.ID]: event.getId(),
            [AccountState.USERNAME]: event.getUsername(),
            [AccountState.PASSWORD_HASH]: event.getPasswordHash(),
            [AccountState.SALT]: event.getSalt(),
        });
    }

    public updateUsername(username: Username): void {
        if (username.equals(Username.fromString(this.state.getUsername()))) {
            return;
        }

        this.recordThat(
            UsernameUpdatedEvent.create(
                this.state.getId(),
                username.toString(),
            ),
        );
    }

    public onUsernameUpdatedEvent(event: UsernameUpdatedEvent): void {
        this.state = this.state.with({
            [AccountState.USERNAME]: event.getUsername(),
        });
    }
}