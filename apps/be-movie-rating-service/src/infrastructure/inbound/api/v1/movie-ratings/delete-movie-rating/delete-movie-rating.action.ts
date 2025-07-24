import { Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBusService, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { DeleteMovieRatingCommand } from '../../../../../../application/use-cases/delete-movie-rating/delete-movie-rating.command';

@Controller('/v1/movie-ratings/:id/delete')
export class DeleteMovieRatingV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard, OwnMovieRatingGuard)
  @Post()
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
