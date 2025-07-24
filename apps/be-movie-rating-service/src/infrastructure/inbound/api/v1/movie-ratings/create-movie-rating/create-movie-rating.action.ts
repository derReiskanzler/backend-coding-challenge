import { Body, Controller, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenticatedUser, CommandBusService, CurrentUser, JwtAuthGuard } from '@backend-monorepo/boilerplate';
import { AccountId, Description, MovieRatingStars, Title } from '@backend-monorepo/domain';
import type { Response } from 'express';
import { CreateMovieRatingCommand } from '../../../../../../application/use-cases/create-movie-rating/create-movie-rating.command';
import { CreateMovieRatingDto } from '../../../dtos/create-movie-rating.dto';

@Controller('/v1/movie-ratings/create')
export class CreateMovieRatingV1Action {
  constructor(
    private readonly commandBus: CommandBusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  public async index(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ValidationPipe({ transform: true })) dto: CreateMovieRatingDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.commandBus.dispatch<string>(
      new CreateMovieRatingCommand(
        Title.fromString(dto.title),
        Description.fromString(dto.description),
        MovieRatingStars.fromNumber(dto.stars),
        AccountId.fromString(user.id),
      )
    );
    
    res.setHeader('id', result);
    res.status(201).json({ message: 'Movie rating created successfully' });
  }
}
