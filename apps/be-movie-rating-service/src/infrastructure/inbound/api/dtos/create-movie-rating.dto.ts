import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieRatingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  stars: number;
}