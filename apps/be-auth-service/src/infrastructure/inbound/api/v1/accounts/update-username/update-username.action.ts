import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBusService } from '@backend-monorepo/boilerplate';
import { AccountId, Username } from '@backend-monorepo/domain';
import { UpdateUsernameCommand } from '../../../../../../application/use-cases/update-username/update-username.command';
import { JwtAuthGuard } from '../../../../../util/guards/jwt.guard';

@Controller('/v1/accounts/:id/update-username')
export class UpdateUsernameV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  public async index(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('username') username: string,
  ): Promise<void> {
    await this.commandBus.dispatch<string>(
      new UpdateUsernameCommand(
        AccountId.fromString(id),
        Username.fromString(username),
      )
    );
  }
}
