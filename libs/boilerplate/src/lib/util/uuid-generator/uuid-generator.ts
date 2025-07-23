import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class UuidGenerator {
    public static generate(): string {
        return v4();
    }
}