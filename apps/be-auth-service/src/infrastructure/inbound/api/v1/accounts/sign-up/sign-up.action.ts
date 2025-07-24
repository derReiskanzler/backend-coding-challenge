import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { CommandBusService } from '@backend-monorepo/boilerplate';
import { SignUpDto } from '../../../dtos/sign-up.dto';
import { SignUpCommand } from '../../../../../../application/use-cases/sign-up/sign-up.command';
import { Password, Username } from '@backend-monorepo/domain';
import type { Response } from 'express';

@Controller('/v1/accounts/sign-up')
export class SignUpV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @Post()
  public async index(
    @Body(new ValidationPipe({ transform: true })) dto: SignUpDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.commandBus.dispatch<string>(
      new SignUpCommand(
        Username.fromString(dto.username),
        Password.fromString(dto.password),
      )
    );
    
    res.setHeader('id', result);
    res.status(201).json({ message: 'Account created successfully' });
  }
}
