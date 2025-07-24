import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { QueryBusService } from '@backend-monorepo/boilerplate';
import { AuthUserDocument } from '../../../../../../application/documents/auth-user.document';
import { GetAccountQuery } from '../../../../../../application/use-cases/get-account/get-account.query';
import { AccountId } from '@backend-monorepo/domain';
import { JwtAuthGuard } from '../../../../../util/guards/jwt.guard';
import { 
  GetAccountResponseDto, 
  AccountNotFoundResponseDto, 
  UnauthorizedResponseDto 
} from '../../../dtos/response/get-account-response.dto';
import { ErrorResponseDto } from '../../../dtos/response/sign-up-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('/v1/accounts/:id')
export class GetAccountV1Action {
  constructor(
    private readonly queryBus: QueryBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get account details by ID',
    description: 'Retrieves detailed information about a specific user account by its unique identifier. Requires JWT authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the account to retrieve',
    example: 'abc123def-456-789-ghi012jkl',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account details retrieved successfully',
    type: GetAccountResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - Invalid or missing JWT token',
    type: UnauthorizedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid account ID format',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Account not found with the provided ID',
    type: AccountNotFoundResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  public async index(
    @Param('id') id: string,
  ): Promise<AuthUserDocument> {
    return await this.queryBus.dispatch<AuthUserDocument>(
      new GetAccountQuery(AccountId.fromString(id)),
    );
  }
}
