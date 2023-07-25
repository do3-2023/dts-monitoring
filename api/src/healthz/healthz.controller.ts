import { Controller, Get, Inject, InternalServerErrorException } from '@nestjs/common';
import { Hello } from 'src/database/hello.entity';
import { Repository } from 'typeorm';

@Controller('healthz')
export class HealthzController {
    constructor(
        @Inject('HELLO_REPOSITORY')
        private helloRepository: Repository<Hello>
    ) {}

    @Get()
    async checkHealth(): Promise<string> {
        try {
            await this.helloRepository.find();
        }
        catch {
            throw new InternalServerErrorException('Error connecting to the database');
        }
        return "heath test passed";
    }
}