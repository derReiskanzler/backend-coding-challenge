import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBusService, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { MovieRatingId, MovieRatingStars } from '@backend-monorepo/domain';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { UpdateStarsCommand } from '../../../../../../application/use-cases/update-stars/update-stars.command';

@Controller('/v1/movie-ratings/:id/update-stars')
export class UpdateStarsV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard, OwnMovieRatingGuard)
  @Post()
  public async index(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('stars') stars: number,
  ): Promise<void> {
    await this.commandBus.dispatch<string>(
      new UpdateStarsCommand(
        MovieRatingId.fromString(id),
        MovieRatingStars.fromNumber(stars),
      )
    );
  }
}
