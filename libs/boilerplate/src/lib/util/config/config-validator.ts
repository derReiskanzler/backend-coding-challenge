import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Config } from './config.model';

export function validateConfig(config: Config) {
    const validatedConfig = plainToInstance(Config, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        forbidUnknownValues: true,
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
