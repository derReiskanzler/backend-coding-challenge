import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the current health status of the Authentication Service. This endpoint can be used for monitoring, load balancer health checks, and service discovery.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy and operational',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Health status message from the Authentication Service',
          example: 'Hello from Auth API'
        }
      }
    },
    examples: {
      healthy: {
        summary: 'Healthy service response',
        value: {
          message: 'Hello from Auth API'
        }
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Service is unhealthy or experiencing issues',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  public getData(): { message: string } {
    return { message: 'Hello from Auth API' };
  }
}
