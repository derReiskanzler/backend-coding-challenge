import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  public getData(): { message: string } {
    return { message: 'Hello from Auth API' };
  }
}
