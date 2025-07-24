import { Controller, Post, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser, TokenPayload } from '@backend-monorepo/boilerplate';
import { LocalAuthGuard } from '../../../../util/guards/local-auth.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiHeader
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('/v1/auth/login')
export class LoginV1Action {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Authenticate user and get JWT token',
    description: 'Authenticates a user with username and password credentials. Upon successful authentication, returns user information and sets an HTTP-only JWT cookie for subsequent requests.',
  })
  @ApiBody({
    description: 'User credentials for authentication',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username for authentication',
          example: 'john_doe123'
        },
        password: {
          type: 'string',
          description: 'Password for authentication',
          example: 'MySecurePass123!',
          format: 'password'
        }
      },
      required: ['username', 'password']
    },
    examples: {
      validLogin: {
        summary: 'Valid login credentials',
        description: 'Example of valid username and password',
        value: {
          username: 'john_doe123',
          password: 'MySecurePass123!'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authentication successful - User authenticated and JWT cookie set',
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
  @ApiHeader({
    name: 'Set-Cookie',
    description: 'HTTP-only JWT authentication cookie',
    required: false,
    schema: {
      type: 'string',
      example: 'Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Expires=Wed, 21 Oct 2024 07:28:00 GMT'
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data - validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication failed - Username doesnt exist or password wrong',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Username doesnt exist or password wrong' },
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