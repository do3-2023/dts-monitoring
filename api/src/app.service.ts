import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Hello } from './database/hello.entity';

@Injectable()
export class AppService {
  constructor(
    @Inject('HELLO_REPOSITORY')
    private helloRepository: Repository<Hello>
  ) {}

  async getHello(): Promise<string> {
    // Insert message in the db
    await this.helloRepository.save({message: "Hello World!"});
    // Get message from the db
    const hello = await this.helloRepository.find();
    if (hello.length === 0) {
      throw new BadRequestException("Couldn't get a message");
    }
    return hello[0].message + ' This message was stored right now in the database. Total number of messages: ' + hello.length;
  }
}
