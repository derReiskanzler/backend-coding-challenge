import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QueryBusService } from '@backend-monorepo/boilerplate';
import { AuthUserDocument } from '../../../../../../application/documents/auth-user.document';
import { GetAccountQuery } from '../../../../../../application/use-cases/get-account/get-account.query';
import { AccountId } from '@backend-monorepo/domain';
import { JwtAuthGuard } from '../../../../../util/guards/jwt.guard';

@Controller('/v1/accounts/:id')
export class GetAccountV1Action {
  constructor(
    private readonly queryBus: QueryBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async index(
    @Param('id') id: string,
  ): Promise<AuthUserDocument> {
    return await this.queryBus.dispatch<AuthUserDocument>(
      new GetAccountQuery(AccountId.fromString(id)),
    );
  }
}
