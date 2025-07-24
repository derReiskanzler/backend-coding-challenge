import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser, TokenPayload } from '@backend-monorepo/boilerplate';
import { Request } from 'express';
import { AccountV1ReadRepository } from '../../outbound/repository/v1/read/account-read.repository';
import { AuthUsersV1ReadmodelReadRepository } from '../../outbound/repository/v1/read/auth-users-readmodel-read.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        readonly configService: ConfigService,
        readonly accountReadRepository: AccountV1ReadRepository,
        readonly accountReadmodelRepository: AuthUsersV1ReadmodelReadRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request & { Authentication: string }) => 
                    request?.cookies?.Authentication ||
                    request?.Authentication ||
                    request?.headers.Authentication
              ]),
            ignoreExpiration: false,
            secretOrKey: (() => {
                const secret = configService.get<string>('jwt.secret');
                if (!secret) {
                    throw new Error('JWT secret not found in configuration');
                }
                return secret;
            })(),
        });
    }

    public async validate(payload: TokenPayload): Promise<AuthenticatedUser> {
        const accountReadmodel = await this.accountReadmodelRepository.getById(payload.sub);
        if (!accountReadmodel) {
            throw new UnauthorizedException();
        }

        const account = await this.accountReadRepository.getById(payload.sub);
        if (!account) {
            throw new UnauthorizedException();
        }
        const state = account.getState();
        
        return { id: state.getId().toString(), username: state.getUsername().toString() };
    }
}