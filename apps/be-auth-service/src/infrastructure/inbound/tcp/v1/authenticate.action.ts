import { Controller, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '@backend-monorepo/boilerplate';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../../../util/guards/jwt.guard';

@Controller()
export class AuthenticateV1Action {
  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  public async index(
    @Payload() data: { Authentication: string },
    @CurrentUser() user: AuthenticatedUser
  ) {
    return user;
  }
}