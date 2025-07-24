import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '@backend-monorepo/boilerplate';
import { JwtAuthGuard } from '../../../../util/guards/jwt.guard';

@Controller('/v1/auth/validate')
export class ValidateV1Action {
  @UseGuards(JwtAuthGuard)
  @Get()
  public async index(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}