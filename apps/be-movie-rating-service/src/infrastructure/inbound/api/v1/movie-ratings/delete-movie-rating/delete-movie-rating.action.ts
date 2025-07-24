import { Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBusService, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { DeleteMovieRatingCommand } from '../../../../../../application/use-cases/delete-movie-rating/delete-movie-rating.command';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse
} from '@nestjs/swagger';

@ApiTags('movie-ratings')
@Controller('/v1/movie-ratings/:id/delete')
export class DeleteMovieRatingV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard, OwnMovieRatingGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete movie rating',
    description: 'Permanently deletes a specific movie rating. Requires JWT authentication and can only be performed by the owner of the rating. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the movie rating to delete (must be a valid UUID)',
    example: 'abc123def-456-789-ghi012jkl',
    type: String,
    required: true,
  })
  @ApiNoContentResponse({
    description: 'Movie rating deleted successfully - no content returned',
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
  @ApiForbiddenResponse({
    description: 'Access denied - You can only delete your own movie ratings',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden (You can only delete your own movie ratings)' },
        error: { type: 'string', example: 'Forbidden' }
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
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.commandBus.dispatch<string>(
      new DeleteMovieRatingCommand(
        MovieRatingId.fromString(id),
      )
    );
  }
}
