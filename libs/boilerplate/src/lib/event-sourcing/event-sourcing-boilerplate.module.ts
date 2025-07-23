import { Module } from '@nestjs/common';
import { EntityManagerProvider } from './providers/entity-manager.provider';

const PROVIDERS = [
    EntityManagerProvider,
];

@Module({
    providers: [
        ...PROVIDERS,
    ],
    exports: [
        ...PROVIDERS,
    ],
})
export class EventSourcingBoilerplateModule {}