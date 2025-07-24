import { Body, Controller, Post, Res, ValidationPipe, HttpStatus } from '@nestjs/common';
import { CommandBusService } from '@backend-monorepo/boilerplate';
import { SignUpDto } from '../../../dtos/request/sign-up.dto';
import { SignUpResponseDto, ErrorResponseDto } from '../../../dtos/response/sign-up-response.dto';
import { SignUpCommand } from '../../../../../../application/use-cases/sign-up/sign-up.command';
import { Password, Username } from '@backend-monorepo/domain';
import type { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiHeader,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse 
} from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('/v1/accounts/sign-up')
export class SignUpV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user account',
    description: 'Creates a new user account with the provided username and password. The password must meet security requirements: at least 8 characters with uppercase, lowercase, number, and special character.',
  })
  @ApiBody({
    type: SignUpDto,
    description: 'User account creation data',
    examples: {
      validUser: {
        summary: 'Valid user creation',
        description: 'Example of valid user account data',
        value: {
          username: 'john_doe123',
          password: 'MySecurePass123!'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
    type: SignUpResponseDto,
  })
  @ApiHeader({
    name: 'id',
    description: 'The ID of the newly created account',
    required: false,
    schema: {
      type: 'string',
      example: 'abc123def-456-789-ghi012jkl'
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data - validation failed',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Username already exists',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
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
