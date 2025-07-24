import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBusService, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { Description, MovieRatingId } from '@backend-monorepo/domain';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { UpdateDescriptionCommand } from '../../../../../../application/use-cases/update-description/update-description.command';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse
} from '@nestjs/swagger';

@ApiTags('movie-ratings')
@Controller('/v1/movie-ratings/:id/update-description')
export class UpdateDescriptionV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard, OwnMovieRatingGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update movie rating description',
    description: 'Updates the description/review for a specific movie rating. Requires JWT authentication and can only be performed by the owner of the rating.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the movie rating to update (must be a valid UUID)',
    example: 'abc123def-456-789-ghi012jkl',
    type: String,
    required: true,
  })
  @ApiBody({
    description: 'New description data',
    schema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'New description/review for the movie',
          example: 'Updated review: Still an amazing film with incredible character development and storytelling.',
          minLength: 1
        }
      },
      required: ['description']
    },
    examples: {
      updateDescription: {
        summary: 'Update movie description',
        value: {
          description: 'Updated review: Still an amazing film with incredible character development and storytelling.'
        }
      }
    }
  })
  @ApiNoContentResponse({
    description: 'Description updated successfully - no content returned',
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
    description: 'Access denied - You can only update your own movie ratings',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden (You can only update your own movie ratings)' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data - validation failed or invalid UUID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array',
          items: { type: 'string' },
          example: ['Description is required', 'Description cannot be empty']
        },
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
    @Body('description') description: string,
  ): Promise<void> {
    await this.commandBus.dispatch<string>(
      new UpdateDescriptionCommand(
        MovieRatingId.fromString(id),
        Description.fromString(description),
      )
    );
  }
}
