import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '@backend-monorepo/boilerplate';
import { JwtAuthGuard } from '../../../../util/guards/jwt.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('/v1/auth/validate')
export class ValidateV1Action {
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Validate JWT token and get current user',
    description: 'Validates the provided JWT token and returns the current authenticated user information. This endpoint is useful for checking token validity and retrieving user context.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid - Returns current user information',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier of the authenticated user',
          example: 'abc123def-456-789-ghi012jkl'
        },
        username: {
          type: 'string',
          description: 'Username of the authenticated user',
          example: 'john_doe123'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Token validation failed - Invalid, expired, or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  public async index(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}