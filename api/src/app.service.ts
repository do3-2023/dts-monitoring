import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Person } from './database/person.entity';

@Injectable()
export class AppService {
  constructor(
    @Inject('PERSON_REPOSITORY')
    private personRepository: Repository<Person>
  ) {}

  async getPeople(): Promise<Array<Person>> {
    // Get people from the db
    const people = await this.personRepository.find();
    return people;
  }

  async addPerson(last_name: string, phone_number: string): Promise<Person> {
    // Insert person in the db
    return await this.personRepository.save({last_name, phone_number});
  }
}
