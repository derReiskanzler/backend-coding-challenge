import { Body, Controller, Post, Res, UseGuards, ValidationPipe, HttpStatus } from '@nestjs/common';
import { AuthenticatedUser, CommandBusService, CurrentUser, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { AccountId, Description, MovieRatingStars, Title } from '@backend-monorepo/domain';
import type { Response } from 'express';
import { CreateMovieRatingCommand } from '../../../../../../application/use-cases/create-movie-rating/create-movie-rating.command';
import { CreateMovieRatingDto } from '../../../dtos/request/create-movie-rating.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';

@ApiTags('movie-ratings')
@Controller('/v1/movie-ratings/create')
export class CreateMovieRatingV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new movie rating',
    description: 'Creates a new movie rating with title, description, and star rating. Requires JWT authentication. The rating will be associated with the authenticated user.',
  })
  @ApiBody({
    type: CreateMovieRatingDto,
    description: 'Movie rating creation data',
    examples: {
      createRating: {
        summary: 'Create movie rating',
        value: {
          title: 'The Shawshank Redemption',
          description: 'An absolutely incredible story of hope and friendship. One of the best films ever made!',
          stars: 5
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Movie rating created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Movie rating created successfully'
        }
      }
    }
  })
  @ApiHeader({
    name: 'id',
    description: 'The ID of the newly created movie rating',
    required: false,
    schema: {
      type: 'string',
      example: 'abc123def-456-789-ghi012jkl'
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data - validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array',
          items: { type: 'string' },
          example: ['Rating must be at least 1 star', 'Title is required']
        },
        error: { type: 'string', example: 'Bad Request' }
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
    @Body(new ValidationPipe({ transform: true })) dto: CreateMovieRatingDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.commandBus.dispatch<string>(
      new CreateMovieRatingCommand(
        Title.fromString(dto.title),
        Description.fromString(dto.description),
        MovieRatingStars.fromNumber(dto.stars),
        AccountId.fromString(user.id),
      )
    );
    
    res.setHeader('id', result);
    res.status(201).json({ message: 'Movie rating created successfully' });
  }
}
