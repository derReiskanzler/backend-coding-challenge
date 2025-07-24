/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

export interface ErrorResponse {
    error: any;
    message: string;
    statusCode: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private isProd: null|undefined = null;
    private readonly logger = new Logger(HttpExceptionFilter.name);

    constructor(private readonly configService: ConfigService) {
        this.isProd = this.configService.get('production');
    }

    public catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const message = exception.message;
        const res: any = exception.getResponse();

        const errorResponse: ErrorResponse = {
            error: {
                name: exception.name,
                message: message,
                hint: res?.message,
            },
            message: exception.message,
            statusCode: status,
        };

        if (!this.isProd) {
            errorResponse.error.trace = exception.stack;
        }

        this.logger.error(`[${request.method}] ${request.url} - ${exception.name} - ${JSON.stringify(exception)} :: System`);

        return response.status(status).json(errorResponse);

    }
}