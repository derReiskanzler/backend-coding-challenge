import { validateConfig } from '@backend-monorepo/boilerplate';
import { Logger } from '@nestjs/common';

const defaultConfig = 'development';

export default () => {
    const logger = new Logger('ConfigLoader');
    const path = require('path');

    const env = process.env.NODE_ENV !== undefined ? process.env.NODE_ENV : defaultConfig;
    logger.debug('Trying to load configuration "' + env + '.json"...');
    logger.debug('Loading path: ' + path.join(__dirname, 'assets','environments', `${env}.json`))

    let rawConfig = require(`./assets/environments/${env}.json`);
    rawConfig = substituteEnv(rawConfig);
    logger.debug('Config:', rawConfig);
    const config = validateConfig(rawConfig);
    if (!config.production) {
        logger.debug('Loaded config: ' + JSON.stringify(config));
    }
    logger.debug('Successfully loaded cfg "' + env + '.json"');
    return config;
};

function substituteEnv(rawConfig: object, prefix = 'NODE_CONFIG_') {
    const logger = new Logger('ConfigLoader');
    logger.debug(
        'Loading config from environment variables (prefix: ' + prefix + '):',
        process.env
    );
    for (const el in process.env) {
        if (el.startsWith(prefix)) {
            logger.debug('Config overwritten', el);
            const config_name = el.replace(prefix, '');
            const config_parts = config_name.split('.');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let setting: any = rawConfig;
            let elem = undefined;
            for (let i = 0; i < config_parts.length - 1; i++) {
                elem = setting[config_parts[i]];
                if (elem === undefined) break;
                setting = elem;
            }
            if (setting[config_parts[config_parts.length - 1]] !== undefined) {
                setting[config_parts[config_parts.length - 1]] = process.env[el];
            }
        }
    }
    return rawConfig;
}
