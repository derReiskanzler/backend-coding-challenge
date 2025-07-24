import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, QueryBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../../../../../application/documents/movie-rating.document';
import { GetMovieRatingQuery } from '../../../../../../application/use-cases/get-movie-rating/get-movie-rating.query';
import { MovieRatingId } from '@backend-monorepo/domain';

@Controller('/v1/movie-ratings/:id')
export class GetMovieRatingV1Action {
  constructor(
    private readonly queryBus: QueryBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async index(
    @Param('id') id: string,
  ): Promise<MovieRatingDocument> {
    return await this.queryBus.dispatch<MovieRatingDocument>(
      new GetMovieRatingQuery(MovieRatingId.fromString(id)),
    );
  }
}
