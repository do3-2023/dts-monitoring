import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthzController } from './healthz/healthz.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { DataSource } from 'typeorm';
import { Person } from './database/person.entity';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [AppController, HealthzController],
  providers: [
    AppService,
    {
      provide: 'PERSON_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Person),
      inject: ['DATA_SOURCE']
    }
  ],
})
export class AppModule {}
