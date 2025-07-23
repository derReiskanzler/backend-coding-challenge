import { IsDefined, IsBoolean, ValidateNested, IsPort, IsString, Matches } from 'class-validator';

class CorsSettings {
    @IsBoolean()
    credentials: boolean;

    @IsBoolean()
    origin: boolean;
}

class AppSettings {
    @IsString()
    @Matches(/^[a-zA-Z0-9.]+/)
    host: string;

    @IsPort()
    port: string;

    @ValidateNested()
    cors: CorsSettings;
}

export class Config {
    @ValidateNested()
    @IsDefined()
    app: AppSettings;
    
    @IsDefined()
    @IsBoolean()
    production: boolean;
}