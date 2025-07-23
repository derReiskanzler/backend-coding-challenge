import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandBusService } from './services/command-bus.service';
import { QueryBusService } from './services/query-bus.service';
import { ReadmodelProjectionsRepository } from './repositories/readmodel-projections-repository';

const SERVICES = [
    CommandBusService,
    QueryBusService,
];

const REPOSITORIES = [
    ReadmodelProjectionsRepository,
];

@Module({
    imports: [CqrsModule.forRoot()],
    providers: [
        ...SERVICES,
        ...REPOSITORIES,
    ],
    exports: [
        ...SERVICES,
        ...REPOSITORIES,
    ],
})
export class CqrsBoilerplateModule {}