import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBusService, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { MovieRatingId, Title } from '@backend-monorepo/domain';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { UpdateTitleCommand } from '../../../../../../application/use-cases/update-title/update-title.command';

@Controller('/v1/movie-ratings/:id/update-title')
export class UpdateTitleV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard, OwnMovieRatingGuard)
  @Post()
  public async index(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('title') title: string,
  ): Promise<void> {
    await this.commandBus.dispatch<string>(
      new UpdateTitleCommand(
        MovieRatingId.fromString(id),
        Title.fromString(title),
      )
    );
  }
}
