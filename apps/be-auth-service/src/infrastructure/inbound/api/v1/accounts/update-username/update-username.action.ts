import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { CommandBusService } from '@backend-monorepo/boilerplate';
import { AccountId, Username } from '@backend-monorepo/domain';
import { UpdateUsernameCommand } from '../../../../../../application/use-cases/update-username/update-username.command';
import { JwtAuthGuard } from '../../../../../util/guards/jwt.guard';
import { OwnAccountGuard } from '../../../../../util/guards/own-account.guard';
import { UpdateUsernameDto } from '../../../dtos/request/update-username.dto';
import { 
  ForbiddenResponseDto, 
  ConflictResponseDto 
} from '../../../dtos/response/update-username-response.dto';
import { 
  UnauthorizedResponseDto, 
  AccountNotFoundResponseDto 
} from '../../../dtos/response/get-account-response.dto';
import { ErrorResponseDto } from '../../../dtos/response/sign-up-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNoContentResponse
} from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('/v1/accounts/:id/update-username')
export class UpdateUsernameV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard, OwnAccountGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update account username',
    description: 'Updates the username for a specific account. Requires JWT authentication and can only be performed by the account owner. The new username must be unique across all users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the account to update (must be a valid UUID)',
    example: 'abc123def-456-789-ghi012jkl',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateUsernameDto,
    description: 'New username data',
    examples: {
      validUpdate: {
        summary: 'Valid username update',
        description: 'Example of valid username update data',
        value: {
          username: 'john_doe_updated'
        }
      }
    }
  })
  @ApiNoContentResponse({
    description: 'Username updated successfully - no content returned',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - Invalid or missing JWT token',
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Access denied - You can only update your own account',
    type: ForbiddenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data - validation failed or invalid UUID format',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Account not found with the provided ID',
    type: AccountNotFoundResponseDto,
  })
  @ApiConflictResponse({
    description: 'Account with username already exists',
    type: ConflictResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  public async index(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateUsernameDto,
  ): Promise<void> {
    await this.commandBus.dispatch<string>(
      new UpdateUsernameCommand(
        AccountId.fromString(id),
        Username.fromString(dto.username),
      )
    );
  }
}
