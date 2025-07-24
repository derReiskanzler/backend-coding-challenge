import { IsDefined, IsBoolean, ValidateNested, IsBooleanString, IsPort, IsString, Matches, IsNumber, IsOptional } from 'class-validator';

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

class DatabaseSettings {
    @IsString()
    @Matches(/^[a-zA-Z0-9.]+/)
    host: string;

    @IsPort()
    port: string;

    @IsString()
    username: string;
    
    @IsString()
    password: string;
    
    @IsString()
    database: string;
    
    @IsBooleanString()
    logging: string;
    
    @IsBoolean()
    ssl: boolean;
}

class MessageBrokerSettings {
    @IsString()
    @Matches(/^[a-zA-Z0-9.]+/)
    host: string;

    @IsNumber()
    port: number;
}

class JwtSettings {
    @IsString()
    secret: string;

    @IsString()
    expiration: string;
}

export class Config {
    @ValidateNested()
    @IsDefined()
    app: AppSettings;

    @IsDefined()
    @IsBoolean()
    production: boolean;

    @ValidateNested()
    @IsDefined()
    event_store: DatabaseSettings;

    @ValidateNested()
    @IsDefined()
    database: DatabaseSettings;

    @ValidateNested()
    @IsDefined()
    message_broker: MessageBrokerSettings;

    @ValidateNested()
    @IsOptional()
    jwt: JwtSettings;
}