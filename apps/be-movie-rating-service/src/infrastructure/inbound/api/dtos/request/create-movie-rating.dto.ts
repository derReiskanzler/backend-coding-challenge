import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateMovieRatingDto {
  @ApiProperty({
    description: 'Title of the movie',
    example: 'The Shawshank Redemption',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Your review/description of the movie',
    example: 'An absolutely incredible story of hope and friendship. One of the best films ever made!',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Star rating for the movie (1-5 stars)',
    example: 5,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Rating must be at least 1 star' })
  @Max(5, { message: 'Rating cannot exceed 5 stars' })
  stars: number;
}