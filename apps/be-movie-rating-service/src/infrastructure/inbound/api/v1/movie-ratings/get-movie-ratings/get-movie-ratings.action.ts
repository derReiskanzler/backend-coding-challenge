import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard, QueryBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../../../../../application/documents/movie-rating.document';
import { GetMovieRatingsQuery } from '../../../../../../application/use-cases/get-movie-ratings/get-movie-ratings.query';
import { GetMovieRatingsDto } from '../../../dtos/get-movie-ratings.dto';
import { AccountId, Title } from '@backend-monorepo/domain';

@Controller('/v1/movie-ratings')
export class GetMovieRatingsV1Action {
  constructor(
    private readonly queryBus: QueryBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
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
