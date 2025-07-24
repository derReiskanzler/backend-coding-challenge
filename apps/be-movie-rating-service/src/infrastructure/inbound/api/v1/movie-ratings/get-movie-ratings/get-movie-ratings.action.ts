import { Controller, Get, Query, UseGuards, ValidationPipe, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard, QueryBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../../../../../application/documents/movie-rating.document';
import { GetMovieRatingsQuery } from '../../../../../../application/use-cases/get-movie-ratings/get-movie-ratings.query';
import { GetMovieRatingsDto } from '../../../dtos/request/get-movie-ratings.dto';
import { AccountId, Title } from '@backend-monorepo/domain';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';

@ApiTags('movie-ratings')
@Controller('/v1/movie-ratings')
export class GetMovieRatingsV1Action {
  constructor(
    private readonly queryBus: QueryBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get movie ratings with filtering and pagination',
    description: 'Retrieves a list of movie ratings with support for filtering by user, title search, pagination, and sorting. Requires JWT authentication.',
  })
  @ApiQuery({
    name: 'accountId',
    required: false,
    description: 'Filter by account ID to get ratings from a specific user',
    example: 'abc123def-456-789-ghi012jkl',
    type: String,
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter by movie title (partial match supported)',
    example: 'Shawshank',
    type: String,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of results to skip for pagination',
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Number of results to return (page size, max 100)',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    description: 'Field to sort by',
    example: 'title',
    enum: ['title', 'stars', 'createdAt'],
  })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Movie ratings retrieved successfully',
    schema: {
      type: 'array',
      items: {
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
            example: 'An absolutely incredible story of hope and friendship.'
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
    description: 'Invalid query parameters - validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array',
          items: { type: 'string' },
          example: ['title cannot be empty, if provided']
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
    @Query(new ValidationPipe({ transform: true })) dto: GetMovieRatingsDto,
  ): Promise<MovieRatingDocument> {
    return await this.queryBus.dispatch<MovieRatingDocument>(
      new GetMovieRatingsQuery(
        dto?.accountId ? AccountId.fromString(dto.accountId) : undefined,
        dto?.title ? Title.fromString(dto.title) : undefined,
        dto?.skip,
        dto?.take,
        dto?.sortField,
        dto?.sortDirection,
      ),
    );
  }
}
