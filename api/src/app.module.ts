import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthzController } from './healthz/healthz.controller';

@Module({
  imports: [],
  controllers: [AppController, HealthzController],
  providers: [AppService],
})
export class AppModule {}
