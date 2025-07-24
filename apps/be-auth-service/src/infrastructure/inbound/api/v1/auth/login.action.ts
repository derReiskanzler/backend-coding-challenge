import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser, TokenPayload } from '@backend-monorepo/boilerplate';
import { LocalAuthGuard } from '../../../../util/guards/local-auth.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Controller('/v1/auth/login')
export class LoginV1Action {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  public async index(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Calculate the token expiration time by adding seconds to the current date
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('jwt.expiration'),
    );

    const payload = { username: user.username, sub: user.id } as TokenPayload;
    const token = this.jwtService.sign(payload);

    response.cookie('Authentication', token, {
      expires: expires,
      httpOnly: true,
    });

    response.send(user);
  }
}