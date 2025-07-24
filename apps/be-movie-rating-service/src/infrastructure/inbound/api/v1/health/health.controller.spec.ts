import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();
    });

    describe('getData', () => {
        it('should return "Hello API"', () => {
            const appController = app.get<HealthController>(HealthController);
            expect(appController.getData()).toEqual({ message: 'Hello from Movie Rating API' });
        });
    });
});
