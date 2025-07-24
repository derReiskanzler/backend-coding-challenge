import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard, QueryBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../../../../../application/documents/movie-rating.document';
import { GetMovieRatingQuery } from '../../../../../../application/use-cases/get-movie-rating/get-movie-rating.query';
import { MovieRatingId } from '@backend-monorepo/domain';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';

@ApiTags('movie-ratings')
@Controller('/v1/movie-ratings/:id')
export class GetMovieRatingV1Action {
  constructor(
    private readonly queryBus: QueryBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get movie rating by ID',
    description: 'Retrieves detailed information about a specific movie rating by its unique identifier. Requires JWT authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the movie rating to retrieve',
    example: 'abc123def-456-789-ghi012jkl',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Movie rating retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier of the movie rating',
          example: 'abc123def-456-789-ghi012jkl'
        },
        title: {
          type: 'string',
          description: 'Title of the movie',
          example: 'The Shawshank Redemption'
        },
        description: {
          type: 'string',
          description: 'User review/description of the movie',
          example: 'An absolutely incredible story of hope and friendship. One of the best films ever made!'
        },
        stars: {
          type: 'number',
          description: 'Star rating (1-5)',
          example: 5,
          minimum: 1,
          maximum: 5
        },
        accountId: {
          type: 'string',
          description: 'ID of the user who created this rating',
          example: 'abc123def-456-789-ghi012jkl'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the rating was created',
          example: '2024-01-15T10:30:00.000Z'
        }
      }
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
    description: 'Invalid movie rating ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid UUID format' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Movie rating not found with the provided ID',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Movie rating not found' },
        error: { type: 'string', example: 'Not Found' }
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
    @Param('id') id: string,
  ): Promise<MovieRatingDocument> {
    return await this.queryBus.dispatch<MovieRatingDocument>(
      new GetMovieRatingQuery(MovieRatingId.fromString(id)),
    );
  }
}
