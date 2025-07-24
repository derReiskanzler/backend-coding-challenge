import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBusService, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { Description, MovieRatingId } from '@backend-monorepo/domain';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { UpdateDescriptionCommand } from '../../../../../../application/use-cases/update-description/update-description.command';

@Controller('/v1/movie-ratings/:id/update-description')
export class UpdateDescriptionV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard, OwnMovieRatingGuard)
  @Post()
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
