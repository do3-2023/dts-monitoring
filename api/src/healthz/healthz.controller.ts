import { Controller, Get, Inject, InternalServerErrorException } from '@nestjs/common';
import { Person } from 'src/database/person.entity';
import { Repository } from 'typeorm';

@Controller('healthz')
export class HealthzController {
    constructor(
        @Inject('PERSON_REPOSITORY')
        private personRepository: Repository<Person>
    ) {}

    @Get()
    async checkHealth(): Promise<string> {
        try {
            await this.personRepository.find();
        }
        catch {
            throw new InternalServerErrorException('Error connecting to the database');
        }
        return "heath test passed";
    }
}