import { Controller, Get } from '@nestjs/common';

@Controller('healthz')
export class HealthzController {
    @Get()
    checkHealth(): string {
        return "heath test passed";
    }
}