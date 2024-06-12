import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { serverConfig } from 'src/server-config';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: 'SERVER_CONFIG', useValue: serverConfig }, // Provide the server config here
  ],
})
export class AppServerModule {}
