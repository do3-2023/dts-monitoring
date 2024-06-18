import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Person } from './database/person.entity';
import { CreatePersonDto } from './dtos/create-person.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getPeople(): Promise<Array<Person>> {
    return await this.appService.getPeople();
  }

  @Post()
  async addPerson(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
    return await this.appService.addPerson(createPersonDto.last_name, createPersonDto.phone_number);
  }
}
