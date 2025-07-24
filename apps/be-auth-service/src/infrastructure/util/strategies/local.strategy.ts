import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticatedUser, Encryptor } from '@backend-monorepo/boilerplate';
import { AccountNotFoundException } from '../../../application/exceptions/account-not-found.exception';
import { AccountV1ReadRepository } from '../../outbound/repository/v1/read/account-read.repository';
import { AuthUsersV1ReadmodelReadRepository } from '../../outbound/repository/v1/read/auth-users-readmodel-read.repository';
import { PasswordWrongException } from '../../exceptions/password-wrong.exception';
import { UsernameDoesNotExistException } from '../../exceptions/username-does-not-exist.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly accountReadmodelRepository: AuthUsersV1ReadmodelReadRepository,
    private readonly accountReadRepository: AccountV1ReadRepository,
  ) {
    super({
      usernameField: 'username',
    });
  }

  public async validate(username: string, password: string): Promise<AuthenticatedUser> {
    const doc = await this.accountReadmodelRepository.getByUsername(username);
    if (!doc) {
      throw UsernameDoesNotExistException.withUsername(username);
    }

    const account = await this.accountReadRepository.getById(doc.id);
    if (!account) {
      throw AccountNotFoundException.withId(doc.id);
    }
    
    const state = account.getState();
    const passwordHash = state.getPasswordHash();
    const salt = state.getSalt();
    if (!passwordHash || !salt|| !Encryptor.validate(passwordHash, password, salt)) {
      throw PasswordWrongException.create();
    }

    return { id: state.getId().toString(), username: state.getUsername().toString() };
  }
}