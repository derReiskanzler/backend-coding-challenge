import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    public getData(): { message: string } {
        return { message: 'Hello from Movie Rating API' };
    }
}
